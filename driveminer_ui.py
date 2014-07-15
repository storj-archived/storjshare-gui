from kivy.app import App
from kivy.properties import ObjectProperty
from kivy.core.window import Window
from kivy.uix.widget import Widget
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.button import Button
from kivy.uix.textinput import TextInput
from kivy.uix.label import Label
from kivy.uix.progressbar import ProgressBar



class DriveMiner(Widget):
	# The events are bound in the driveminer.kv file.
	application_cancel = ObjectProperty(None)
	def app_cancel_callback(self, instance):
		# Same as the first callback function
		print("[X] Pressed/Released")
		self.address.text = "Good-bye!"
		pass
	
	address = ObjectProperty(None)
	storage_percent = ObjectProperty(None)
	storage_bar = ObjectProperty(None)
	upper_storage_limit = ObjectProperty(None)
	free = ObjectProperty(None)
	used = ObjectProperty(None)
	total = ObjectProperty(None)
		
	settings_btn = ObjectProperty(None)
	def settings_callback(self, instance):
		# Put your code here for when the settings button is pressed
		print("SETTINGS Pressed/Released")
		pass
		
	go_btn = ObjectProperty(None)
	def go_callback(self, instance):
		# Same as the first callback function
		print("GO Pressed/Released")
		self.address.text = "Address text input changed."
		self.storage_bar.value = 58
		pass
	
	pass

class DriveMinerApp(App):
	def build(self):
		return DriveMiner()
		
if __name__ == "__main__":
	DriveMinerApp().run();