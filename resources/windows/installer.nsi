; NSIS packaging/install script
; Docs: http://nsis.sourceforge.net/Docs/Contents.html

!include FileFunc.nsh
!include LogicLib.nsh
!include nsDialogs.nsh
!include x64.nsh

; --------------------------------
; Variables
; --------------------------------

!define dest "{{dest}}"
!define src "{{src}}"
!define name "{{name}}"
!define productName "{{productName}}"
!define publisher "{{publisher}}"
!define version "{{version}}"
!define icon "{{icon}}"
!define setupIcon "{{setupIcon}}"
!define banner "{{banner}}"
!define is32bit "{{is32bit}}"

!define exec "{{productName}}.exe"

!define regkey "Software\${productName}"
!define uninstkey "Software\Microsoft\Windows\CurrentVersion\Uninstall\${productName}"

!define uninstaller "uninstall.exe"

SetCompressor /SOLID lzma

Var Arch
Var Image
Var ImageHandle

; Create the shared function.
!macro MYMACRO un
    Function ${un}init

        ${If} ${is32bit} == "true"
            StrCpy $InstDir "$ProgramFiles32\${productName}"
            StrCpy $Arch "32-bit"
            SetRegView 32
        ${Else}
            StrCpy $InstDir "$ProgramFiles64\${productName}"
            StrCpy $Arch "64-bit"
            SetRegView 64
        ${EndIf}

    FunctionEnd
!macroend

!insertmacro MYMACRO "un."
!insertmacro MYMACRO ""

; --------------------------------
; Installation
; --------------------------------

!ifdef INNER

    ; don't ask for admin privilages
    RequestExecutionLevel user
    OutFile "${src}\..\writeuninstaller.exe"

!else

    !system "$\"${NSISDIR}\makensis$\" /DINNER installer.nsi" = 0

    !system "${src}\..\writeuninstaller.exe" = 2

    Name "${productName}"
    Icon "${setupIcon}"
    OutFile "${dest}"
    InstallDirRegKey HKLM "${regkey}" ""

    CRCCheck on
    SilentInstall normal

    XPStyle on
    ShowInstDetails nevershow
    AutoCloseWindow false
    WindowIcon off

    Caption "${productName} Setup"
    ; Don't add sub-captions to title bar
    SubCaption 3 " "
    SubCaption 4 " "

    Page custom welcome.confirm welcome.confirmOnLeave
    Page instfiles

!endif

Function .onInit

    ; Call variables for 32-bit / 64-bit
    Call init

!ifdef INNER

    WriteUninstaller "${src}\uninstall.exe"

    Quit

!endif

; Extract banner image for welcome page
InitPluginsDir
ReserveFile "${banner}"
File /oname=$PLUGINSDIR\banner.bmp "${banner}"

FunctionEnd

!ifndef INNER

Var AddFirewallRuleCheckbox
Var AddFirewallRuleCheckbox_State

; Custom welcome page
Function welcome.confirm

    nsDialogs::Create 1018

    ${NSD_CreateBitmap} 0 0 170 210 ""
    Pop $Image
    ${NSD_SetImage} $Image $PLUGINSDIR\banner.bmp $ImageHandle

    ${NSD_CreateLabel} 176 9 262 100 "Welcome to ${productName} version ${version} installer.$\r$\n$\r$\nSelect options below and click Install."

    ${NSD_CreateCheckbox} 176 114 262 24 "Add Windows Firewall Rule"
    Pop $AddFirewallRuleCheckbox

    nsDialogs::Show

    ${NSD_FreeImage} $ImageHandle
FunctionEnd

Function welcome.confirmOnLeave

    ; Save checkbox state on page leave
    ${NSD_GetState} $AddFirewallRuleCheckbox $AddFirewallRuleCheckbox_State

FunctionEnd
!endif

; Installation declarations
Section "Install"

!ifndef INNER

    ; Write application and uninstaller registry keys
    WriteRegStr HKLM "${regkey}" "Install_Dir" "$INSTDIR"
    WriteRegStr HKLM "${uninstkey}" "DisplayName" "${productName} ($Arch)"
    WriteRegStr HKLM "${uninstkey}" "Publisher" "${publisher}"
    WriteRegStr HKLM "${uninstkey}" "DisplayIcon" '"$INSTDIR\icon.ico"'
    WriteRegStr HKLM "${uninstkey}" "DisplayVersion" "${version}"
    WriteRegStr HKLM "${uninstkey}" "UninstallString" '"$INSTDIR\${uninstaller}"'

    ; Remove all application files copied by previous installation
    RMDir /r "$INSTDIR"

    SetOutPath $INSTDIR

    ; Sign all binaries if a code sign certificate is set
    !if "$%CERT_FILE%" != "${U+24}%CERT_FILE%"
        !system "signtool.exe sign /fd sha256 /td sha256 /tr http://timestamp.digicert.com /f $\"%CERT_FILE%$\" /p $\"%CERT_PASSWORD%$\" $\"${src}\*.exe$\""
    !endif

    ; Include all files from /build directory
    File /r "${src}\*"

    ; Create start menu shortcut
    CreateShortCut "$SMPROGRAMS\${productName} ($Arch).lnk" "$INSTDIR\${exec}" "" "$INSTDIR\icon.ico"
    
    ; Set Windows Firewall rule via PowerShell if user checked this option
    ${If} $AddFirewallRuleCheckbox_State == ${BST_CHECKED}
        nsExec::ExecToStack "powershell -Command $\"New-NetFirewallRule -DisplayName '${productName}' -Direction Inbound -Program '$INSTDIR\${exec}' -Action allow$\"  "
    ${EndIf}

    SetOutPath $INSTDIR
 
    ; Include signed uninstaller
    File ${src}\uninstall.exe

    ; Write EstimatedSize uninstaller registry key
    ${GetSize} "$INSTDIR" "/S=0K" $0 $1 $2
    IntFmt $0 "0x%08X" $0
    WriteRegDWORD HKLM "${uninstkey}" "EstimatedSize" "$0"
!endif
SectionEnd

Function .onInstSuccess
    Exec "$INSTDIR\${exec}"
FunctionEnd

!ifdef INNER
; --------------------------------
; Uninstaller
; --------------------------------

ShowUninstDetails nevershow

UninstallCaption "${productName} Uninstall"
UninstallText "Don't like ${productName} anymore? Hit uninstall button."
UninstallIcon "${icon}"

UninstPage custom un.confirm un.confirmOnLeave
UninstPage instfiles

Var RemoveAppDataCheckbox
Var RemoveAppDataCheckbox_State
Var RemoveWindowsFirewallCheckbox
Var RemoveWindowsFirewallCheckbox_State
Var Image
Var ImageHandle

; Custom uninstall confirm page
Function un.confirm

    nsDialogs::Create 1018

    ${NSD_CreateBitmap} 0 0 170 210 ""
    Pop $Image
    ${NSD_SetImage} $Image $PLUGINSDIR\banner.bmp $ImageHandle

    ${NSD_CreateLabel} 176 9 262 100 "Welcome to ${productName} version ${version} uninstall.$\r$\n$\r$\nSelect options below and click Uninstall."

    ${NSD_CreateCheckbox} 176 114 262 24 "Remove my ${productName} personal data"
    Pop $RemoveAppDataCheckbox

    ${NSD_CreateCheckbox} 176 144 262 24 "Remove Windows Firewall Rule"
    Pop $RemoveWindowsFirewallCheckbox

    nsDialogs::Show

FunctionEnd

Function un.confirmOnLeave

    ; Save checkbox state on page leave
    ${NSD_GetState} $RemoveAppDataCheckbox $RemoveAppDataCheckbox_State
    ${NSD_GetState} $RemoveWindowsFirewallCheckbox $RemoveWindowsFirewallCheckbox_State

FunctionEnd

; Uninstall declarations
Section "Uninstall"

    ; Call variables for 32-bit / 64-bit
    Call un.init

    ; Remove all Registry keys
    DeleteRegKey HKLM "${uninstkey}"
    DeleteRegKey HKLM "${regkey}"

    Delete "$SMPROGRAMS\${productName} ($Arch).lnk"

    ; Remove whole directory from Program Files
    RMDir /r "$INSTDIR"

    ; Try to remove the Windows Firewall rule if user checked this option
    ${If} $RemoveWindowsFirewallCheckbox_State == ${BST_CHECKED}
        nsExec::ExecToStack "powershell -Command $\"Remove-NetFirewallRule -DisplayName '${productName}' -ErrorAction SilentlyContinue$\"  "
    ${EndIf}

    ; Remove also appData directory generated by your app if user checked this option
    ${If} $RemoveAppDataCheckbox_State == ${BST_CHECKED}
        RMDir /r "$LOCALAPPDATA\${productName}"
    ${EndIf}

SectionEnd
!endif
