#
# The Kivy interface for DriveShare.
#
# me@leefallat.ca - 2014
#

from kivy.app import App
from kivy.lang import Builder
from kivy.uix.screenmanager import ScreenManager, Screen, NoTransition
from kivy.properties import Property
from kivy.properties import StringProperty
from kivy.properties import ObjectProperty
from kivy.properties import NumericProperty
from kivy.properties import ListProperty
from kivy.uix.widget import Widget
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.floatlayout import FloatLayout
from kivy.uix.popup import Popup
from kivy.uix.button import Button
from kivy.uix.textinput import TextInput
from kivy.uix.label import Label
from kivy.uix.progressbar import ProgressBar
from kivy.config import Config
import kivy.utils

import webbrowser

# Globals
screen_manager = None

class MainMenu(BoxLayout):
	SCJX_LABEL = 'SJCX: '
	top_row_text = Property(SCJX_LABEL+'0.00000000')
	storage_percent = Property('0%')
	storage_bar = NumericProperty(0)
	lower_storage_limit = Property('0')
	upper_storage_limit = Property('0 GB')
	free_amount = Property('0 GB')
	used_amount = Property('0 GB')
	total_amount = Property('0 GB')
	go_text = Property('GO')

	# The events are bound in the driveshare.kv file.
	def go_settings(self):
		global screen_manager
		screen_manager.current = "settings"

	def go_toggle(self, instance):
		# Same as the first callback function
		if instance.actual_state == "normal":
			instance.actual_state = "down"
		else:
			instance.actual_state = "normal"

		go_text = App.get_running_app().GO_TOGGLE_TEXT['stop'] if instance.actual_state == 'down' else App.get_running_app().GO_TOGGLE_TEXT['go']
		go_bg = App.get_running_app().RED if instance.actual_state == 'down' else App.get_running_app().GREEN

		instance.text = go_text
		instance.background_color = go_bg

class SettingsMenu(BoxLayout):
	global screen_manager

	payout_address = StringProperty('Paste your address here')
	allocated_space = StringProperty('0')
	node = StringProperty('http://node1.metadisk.org/')
	def go_main(self):
		screen_manager.current = "main"

	def save_settings(self, instance):
		screen_manager.current = "main"

	def dismiss_popup(self):
		self._popup.dismiss()

	def show_fileselect(self):
		content = FileSelectDialog(select=self.select, cancel=self.dismiss_popup)
		self._popup = Popup(title="Select file", content=content, size_hint=(0.9, 0.9))
		self._popup.open()

	def select(self, path, filename):
		self.filename = path+filename
		self.dismiss_popup()

class FileSelectDialog(FloatLayout):
	select = ObjectProperty(None)
	text_input = ObjectProperty(None)
	cancel = ObjectProperty(None)

# Screens have widgets added to them via .kv
class MainScreen(Screen):
	pass

class SettingsScreen(Screen):
	pass

class DriveShareApp(App):
	folder = StringProperty('C:\drivefarming\\')

	GREEN = [0.62, 0.83, 0.40, 1]
	BLUE = [0.30, 0.75, 0.91, 1]
	RED = [0.98, .43, 0.31, 1]
	YELLOW = [9.0, 0.80, 0.27, 1]
	DARK_YELLOW = [0.82, 0.64, 0.25, 1]
	LIGHT_GREY = [0.93, 0.93, 0.93, 1]
	DARK_GREY = [0.26, 0.29, 0.33, 1]
	GREY = [0.66, 0.69, 0.74, 1]
	BACKGROUND = [1, 1, 1, 1]
	GO_TOGGLE_TEXT = {'go':"GO",  'stop':"STOP"};
	STORJCOIN_URL = "http://storjcoin.com"

	def app_goto_site_callback(self):
		webbrowser.open_new_tab(App.get_running_app().STORJCOIN_URL)

	def build(self):
		global screen_manager
		Config.set('graphics', 'width', '300')
		Config.set('graphics', 'height', '430')
		Config.set('graphics', 'resizable', '0')

		# Screens - widgets (in most cases layouts) added via .kv
		screen_manager = ScreenManager(transition=NoTransition())
		screen_manager.add_widget(MainScreen(name="main"))
		screen_manager.add_widget(SettingsScreen(name="settings"))
		screen_manager.current = "main"

		return screen_manager

if __name__ == "__main__":
	DriveShareApp().run();
