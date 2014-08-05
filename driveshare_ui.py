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


class FileSelectDialog(FloatLayout):
	select = ObjectProperty(None)
	text_input = ObjectProperty(None)
	cancel = ObjectProperty(None)

class SettingsMenu(BoxLayout):
	global screen_manager

	filename = StringProperty('')
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



class Main(BoxLayout):
	STORJCOIN_URL = "http://storjcoin.com"

	GREEN = [0.62, 0.83, 0.40, 1]
	RED = [0.98, .43, 0.31, 1]
	YELLOW = [9.0, 0.80, 0.27, 1]
	DARK_YELLOW = [0.82, 0.64, 0.25, 1]
	GO_TOGGLE_TEXT = {'go':"GO",  'stop':"STOP"}

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
	go_bg = ListProperty(GREEN)


	# The events are bound in the driveshare.kv file.
	def app_goto_site_callback(self, instance):
		webbrowser.open_new_tab(self.STORJCOIN_URL)

	def go_settings(self):
		global screen_manager
		screen_manager.current = "settings"

	def go_toggle(self, instance):
		# Same as the first callback function
		if instance.actual_state == "normal":
			instance.actual_state = "down"
		else:
			instance.actual_state = "normal"

		go_text = self.GO_TOGGLE_TEXT['stop'] if instance.actual_state == 'down' else self.GO_TOGGLE_TEXT['go']
		go_bg = self.RED if instance.actual_state == 'down' else self.GREEN

		instance.text = go_text
		instance.background_color = go_bg

# Screens have widgets added to them via .kv
class MainScreen(Screen):
	pass

class SettingsScreen(Screen):
	pass

class DriveShareApp(App):
	def build(self):
		global screen_manager
		Config.set('graphics', 'width', '300')
		Config.set('graphics', 'height', '370')
		Config.set('graphics', 'resizable', '0')

		# Screens - widgets (in most cases layouts) added via .kv
		screen_manager = ScreenManager(transition=NoTransition())
		screen_manager.add_widget(MainScreen(name="main"))
		screen_manager.add_widget(SettingsScreen(name="settings"))


		return screen_manager

if __name__ == "__main__":
	DriveShareApp().run();
