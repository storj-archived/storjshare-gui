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
from kivy.uix.floatlayout import FloatLayout
from kivy.uix.relativelayout import RelativeLayout
from kivy.uix.button import Button
from kivy.uix.label import Label
from kivy.uix.screenmanager import ScreenManager, Screen, NoTransition
from kivy.uix.textinput import TextInput
from kivy.uix.dropdown import DropDown
from kivy.uix.popup import Popup
from kivy.properties import StringProperty, ListProperty, ObjectProperty, NumericProperty
from kivy.factory import Factory

import webbrowser

class DenominatorDropDown(DropDown):
	def open_drop(self,parent):
		drop_down = Factory.DenominatorDropDown()
		drop_down.open(parent)
class NodeDropDown(DropDown):
	def open_drop(self,parent):
		drop_down = Factory.NodeDropDown()
		drop_down.open(parent)
class SJCXAddressDropDown(DropDown):
	def open_drop(self,parent):
		drop_down = Factory.SJCXAddressDropDown()
		drop_down.open(parent)

class FileSelectDialog(FloatLayout):
	select = ObjectProperty(None)
	text_input = ObjectProperty(None)
	cancel = ObjectProperty(None)

class DriveShareApp(App):

	# State variable that indicates whether DriveShare is active farming. This value is used by the GUI to determine in what state the GUI should launch.
	farming_active = False # placeholder

	allocated_space = NumericProperty(100)

	used_space = NumericProperty(58)

	node = StringProperty('node1.metadisk.org') # placeholder
	nodedropdown = NodeDropDown()

	denominator = StringProperty('GB') # placeholder
	denominatordropdown = DenominatorDropDown()

	sjcxaddress = StringProperty('1C5Ch7vrtGvAyGFbqZM3RFH3koHjse14a7') # placeholder
	sjcxaddressdropdown = SJCXAddressDropDown()

	inputstate_node = StringProperty('node1.metadisk.org')
	inputstate_allocated_space = StringProperty(str(100))
	inputstate_denominator = StringProperty('GB')
	inputstate_sjcxaddress = StringProperty('1C5Ch7vrtGvAyGFbqZM3RFH3koHjse14a7')


	def settings_save(self):
		self.node            = self.inputstate_node
		self.allocated_space = float(self.inputstate_allocated_space)
		self.denominator     = self.inputstate_denominator
		self.sjcxaddress     = self.inputstate_sjcxaddress

	def settings_cancel(self):
		self.inputstate_node            = self.node
		self.inputstate_allocated_space = str(self.allocated_space)
		self.inputstate_denominator     = self.denominator
		self.inputstate_sjcxaddress     = self.sjcxaddress

	def toggle(self):
		if self.farming_active == False:
			self.farming_active = True
		else:
			self.farming_active = False
		# Code goes here

	def dismiss_popup(self):
		self._popup.dismiss()

	def show_fileselect(self):
		content = FileSelectDialog(select=self.select, cancel=self.dismiss_popup)
		self._popup = Popup(title="Select file", content=content, size_hint=(0.9, 0.9))
		self._popup.open()

	def select(self, path, filename):
		self.filename = path+filename
		self.dismiss_popup()

	def help_button_callback(self):
		webbrowser.open_new_tab('http://www.storj.io/')

	def build(self):
		return self.root


if __name__ == '__main__':
	DriveShareApp().run()

