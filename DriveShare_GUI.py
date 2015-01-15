# Written in kivy 1.8.0

''' NOTE: Because of a bug in Kivy, the padding property for
LABELS in kv is wrong (uses negative value).
Once Kivy 1.8.1 is released, this is supposedly fixed according
to their doc. Then the padding property should probably have its
values negated throughout. For now, the program is made to work
with kivy 1.8.0 using the wrong values.'''

from __future__ import division
import kivy
kivy.require('1.8.0')

from kivy.app import App
from kivy.config import Config
Config.set('kivy', 'window_icon', './images/favicon2.png')
Config.set('graphics', 'width', '400')
Config.set('graphics', 'height', '432')
Config.set('graphics', 'resizable', '0')
Config.set('graphics', 'position', 'custom')
Config.set ( 'input', 'mouse', 'mouse,disable_multitouch' )

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

import webbrowser, os, time, threading, json, math, codecs
from hashlib import sha256
from downstream_farmer import shell
from downstream_farmer.shell import parse_args, eval_args

class FileSelectDialog(FloatLayout):
	select = ObjectProperty(None)
	text_input = ObjectProperty(None)
	cancel = ObjectProperty(None)

class DriveShareApp(App):
	# State variable that indicates whether DriveShare is active farming. This value is used by the GUI to determine in what state the GUI should launch.
	farming_active = False

	total_space = 10 # placeholder
	used_space = 1 # placeholder
	free_space = 9 # placeholder

	node = StringProperty("https://live.driveshare.org:8443") # placeholder

	heartbeats = StringProperty("0")
	contracts = StringProperty("0")

	sjcxaddress = StringProperty('') # placeholder
	message = StringProperty('verify') # placeholder
	signature = StringProperty('signature') # placeholder

	inputstate_node = node # placeholder
	inputstate_sjcxaddress = StringProperty('') # placeholder
	inputstate_message = StringProperty('verify') # placeholder
	inputstate_signature = StringProperty('signature') # placeholder

	farmer_thread = None # Farmer thread
	heartbeat_thread = None # Thread that checks for heartbeats and contracts

	if hasattr(os, 'statvfs'):
		st = os.statvfs('./data') # Information about ./data folder
		free_space = st.f_bavail * st.f_frsize # Free space in ./data
		total_space = st.f_blocks * st.f_frsize # Total space in ./data
		used_space = (st.f_blocks - st.f_bfree) * st.f_frsize # Used space in ./data

		total_storage_in_gb = int(((total_space / 1024) / 1024) / 1024) # Total space converted to GB
		used_storage_in_gb = int(((used_space / 1024) / 1024) / 1024) # Used space converted to GB
		free_storage_in_gb = int(((free_space / 1024) / 1024) / 1024) # Free space converted to GB
	elif os.name == 'nt':
		import ctypes
		import sys

		path = "./data"
		_, total, free = ctypes.c_ulonglong(), ctypes.c_ulonglong(), \
			ctypes.c_ulonglong()
		if sys.version_info >= (3,) or isinstance(path, unicode):
			fun = ctypes.windll.kernel32.GetDiskFreeSpaceExW
		else:
			fun = ctypes.windll.kernel32.GetDiskFreeSpaceExA
			ret = fun(path, ctypes.byref(_), ctypes.byref(total), ctypes.byref(free))
		if ret == 0:
			raise ctypes.WinError()
		used = total.value - free.value

		total_storage_in_gb = int(((total.value / 1024) / 1024) / 1024)
		used_storage_in_gb = int(((used / 1024) / 1024) / 1024)
		free_storage_in_gb = int(((free.value / 1024) / 1024) / 1024)
 
	# Set settings field and create identites.json to save settings on
	if (os.path.exists(os.path.join('data', 'identities.json'))):
		with open(os.path.join('data', 'identities.json'), 'r') as f:
			j = json.loads(f.read())
			sjcxaddress = list(j.keys())[0]
			inputstate_sjcxaddress = sjcxaddress

			message = j[sjcxaddress]["message"]
			inputstate_message = j[sjcxaddress]["message"]

			signature = j[sjcxaddress]["signature"]
			inputstate_signature = j[sjcxaddress]["signature"]
	else:
		with open(os.path.join('data', 'identities.json'), 'w') as f:
			j = {}
			j["address"] = {}
			j["address"]["message"] = "message"
			j["address"]["signature"] = "signature"

			sjcxaddress = list(j.keys())[0]
			inputstate_sjcxaddress = sjcxaddress

			message = j[sjcxaddress]["message"]
			inputstate_message = j[sjcxaddress]["message"]

			signature = j[sjcxaddress]["signature"]
			inputstate_signature = j[sjcxaddress]["signature"]

			f.write(json.dumps(j))

	if (os.path.exists(os.path.join('data', 'history.json'))):
		with open(os.path.join('data', 'history.json'), 'r') as f:
			j = json.loads(f.read())
			node = j["last_node"]
			inputstate_node = j["last_node"]
	else:
		with open(os.path.join('data', 'history.json'), 'w') as f:
			j = {}
			j["last_node"] = "https://live.driveshare.org:8443"

			f.write(json.dumps(j))

	digits58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

	"""
	Decodes base58 address
	"""
	def decode_base58(self, bc, length):
		n = 0
		for char in bc:
			n = n * 58 + self.digits58.index(char)
		return codecs.decode(('%%0%dx' % (length << 1) % n), "hex_codec")[-length:]

	"""
	Check if specified SJCX/Bitcoin address is valid
	"""
	def check_bc(self, bc):
		bcbytes = self.decode_base58(bc, 25)
		return bcbytes[-4:] == sha256(sha256(bcbytes[:-4]).digest()).digest()[:4]

	"""
	Set background color according to if btc address is valid
	"""
	def sjcxbg(self, red, green, address):
		if self.check_bc(address) == True:
			return green
		else:
			return red

	def settings_save(self):
		self.node        = self.inputstate_node # Set node field value to node variable
		self.sjcxaddress = self.inputstate_sjcxaddress # Set address field value to address variable
		self.message = self.inputstate_message # Set message field value to message variable
		self.signature = self.inputstate_signature # Set signature field value to signature variable

		# Save settings
		with open(os.path.join('data', 'history.json'), 'r+') as f:
			j = json.loads(f.read())
			f.seek(0)

			j["last_node"] = self.node

			f.write(json.dumps(j))
			f.truncate()

		with open(os.path.join('data', 'identities.json'), 'r+') as f:
			f.seek(0)
			j = {}
			j[self.inputstate_sjcxaddress] = {}
			j[self.inputstate_sjcxaddress]["message"] = self.inputstate_message
			j[self.inputstate_sjcxaddress]["signature"] = self.inputstate_signature

			f.write(json.dumps(j))
			f.truncate()

	def settings_cancel(self):
		self.inputstate_node            = self.node # Set node variable value to node field
		self.inputstate_sjcxaddress     = self.sjcxaddress # Set node variable value to node field
		self.inputstate_message = self.message # Set node variable value to node field
		self.inputstate_signature = self.signature # Set node variable value to node field

	"""
		Start and Stop button callback
	"""
	def toggle(self):
		if self.farming_active == False:
			self.farming_active = True

			self.args = shell.parse_args() # Usually standard values
			self.args.identity = os.path.join('data', 'identities.json') # Set identity path to ./data/identities.json
			self.args.history = os.path.join('data', 'history.json') # Set history path to ./data/history.json
			self.args.keepalive = True # Keep alive argument to true, so the farmer restarts if crash occurs
			self.args.api.start() # Set api.running to 1

			self.farmer_thread = threading.Thread(target=eval_args,args=(self.args,)) # Replace existing thread or start new farmer thread
			self.farmer_thread.daemon = True # Set thread as daemon so it doesn't freeze the GUI and exit with the GUI
			self.farmer_thread.start() # Start the thread

			if not self.heartbeat_thread:
				self.heartbeat_thread = threading.Thread(target=self.checkForHeartbeat) # Create thread only if it doesn't exist
				self.heartbeat_thread.daemon = True # Set thread as daemon so it doesn't freeze the GUI and exit with the GUI
				self.heartbeat_thread.start() # Start the thread
		else:
			self.args.api.stop() # Set api.running to 0 so the farmer stops
			self.farming_active = False # Farmer inacitve state

	"""
		Updates heartbeat and contracts information
	"""
	def checkForHeartbeat(self):
		while self.args.api.running:
			time.sleep(5) # Sleep so it doesn't constantly check
			self.heartbeats = str(self.args.api.retrieve_heartbeats())
			self.contracts = str(self.args.api.retrieve_contracts())

	def help_button_callback(self):
		webbrowser.open_new_tab('http://www.driveshare.org/')

	def __init__(self, **kwargs):
		super(DriveShareApp, self).__init__(**kwargs)

	def build(self):
		return self.root

if __name__ == '__main__':
	DriveShareApp().run()