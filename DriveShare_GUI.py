# Written in kivy 1.8.0

''' NOTE: Because of a bug in Kivy, the padding property for
LABELS in kv is wrong (uses negative value).
Once Kivy 1.8.1 is released, this is supposedly fixed according
to their doc. Then the padding property should probably have its
values negated throughout. For now, the program is made to work
with kivy 1.8.0 using the wrong values.'''

from kivy.app import App
from kivy.config import Config
Config.set('kivy', 'window_icon', './images/favicon2.png')
Config.set('graphics', 'width', '300')
Config.set('graphics', 'height', '422')
Config.set('graphics', 'resizable', '0')

from kivy.uix.widget import Widget
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.relativelayout import RelativeLayout
from kivy.uix.button import Button
from kivy.uix.label import Label
from kivy.uix.screenmanager import ScreenManager, Screen, NoTransition
from kivy.uix.textinput import TextInput
from kivy.uix.dropdown import DropDown
from kivy.properties import StringProperty, ListProperty

import webbrowser

class DriveShareApp(App): # flaf capitalization

	# State variable that indicates whether DriveShare is active farming. The value here should initialize based on some .ini config file or something. This value is used by the GUI to determine in what state the program should launch.
	farming_active = False

	used_storage_percentage = 0.58

	def toggle(self):
		if self.farming_active == False:
			self.farming_active = True
		else:
			self.farming_active = False
		# Code goes here

	def help_button_callback(self):
		webbrowser.open_new_tab('http://www.storj.io/')

	def build(self):
		return self.root


if __name__ == '__main__':
	DriveShareApp().run()
