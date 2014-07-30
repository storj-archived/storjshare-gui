#
# The Kivy interface for DriveMiner.
#
# me@leefallat.ca - 2014
#

from kivy.app import App
from kivy.properties import Property
from kivy.properties import NumericProperty
from kivy.properties import ListProperty
from kivy.uix.widget import Widget
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.button import Button
from kivy.uix.textinput import TextInput
from kivy.uix.label import Label
from kivy.uix.progressbar import ProgressBar
from kivy.config import Config
import kivy.utils

import webbrowser

class DriveMiner(BoxLayout):	
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
	
	
	# The events are bound in the driveminer.kv file.
	def app_goto_site_callback(self, instance):
		webbrowser.open_new_tab(self.STORJCOIN_URL)
		
	def settings_callback(self, instance):
		# Same as the first callback function
		print("[SETTINGS] released")
		
	def go_toggle(self, instance):
		# Same as the first callback function
		if instance.actual_state == "normal":
			instance.state = "down"
			instance.actual_state = "down"
		else:
			instance.state = "normal"
			instance.actual_state = "normal"
			
		go_text = self.GO_TOGGLE_TEXT['stop'] if instance.state == 'down' else self.GO_TOGGLE_TEXT['go']
		
		instance.text = go_text
		
	def go_toggle_on(self, instance):
		instance.state = "down"
		pass

class DriveMinerApp(App):
	def build(self):
		Config.set('graphics', 'width', '300')
		Config.set('graphics', 'height', '370')
		Config.set('graphics', 'resizable', '0')
		return DriveMiner()
		
if __name__ == "__main__":
	DriveMinerApp().run();