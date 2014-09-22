			function get_radio(field) {
				var sizes = document.theForm[field];
    			return sizes[0].value;
			}

			// Saves options to localStorage.
			function save_options() {
				var checkbox_openyoutubelinks = document.getElementById("openyoutubelinks");
				var radio_nonstandardlinks = document.forms.nonstandardlinks.elements.linkhandle;
				var checkbox_openvisitedlinks = document.getElementById("openvisitedlinks");
				var checkbox_opennsfwlinks = document.getElementById("opennsfwlinks");
				var input_tabslimit = document.getElementById("tabslimit");
				var input_keyboardshortcut = document.getElementById("keyboardshortcut");

				if(input_tabslimit.value == null || input_tabslimit.value < 1) {
					alert("You need to open at least one link!");
					input_tabslimit.value = localStorage["tabslimit"];
					return;
				}

				localStorage["openyoutubelinks"] = checkbox_openyoutubelinks.checked;
				localStorage["nonstandardlinks"] = radio_nonstandardlinks.value;
				localStorage["openvisitedlinks"] = checkbox_openvisitedlinks.checked;
				localStorage["opennsfwlinks"] = checkbox_opennsfwlinks.checked;
				localStorage["tabslimit"] = input_tabslimit.value;

				localStorage["oldkeyboardshortcut"] = localStorage["keyboardshortcut"];

				localStorage["keyboardshortcut"] = input_keyboardshortcut.value;

				var bg = chrome.extension.getBackgroundPage();

				bg.updateSettings();

				// Update status to let user know options were saved.
				var status = document.getElementById("status");
				status.innerHTML = '<span style="color:#FF0000">Options Saved.</span><br>';
				setTimeout(function() {
					status.innerHTML = "";
				}, 750);
			}

			// Restores select box state to saved value from localStorage.
			function restore_options() {
				var openyoutubelinks = localStorage["openyoutubelinks"];
				var nonstandardlinks = localStorage["nonstandardlinks"];
				var openvisitedlinks = localStorage["openvisitedlinks"];
				var opennsfwlinks = localStorage["opennsfwlinks"];
				var tabslimit = localStorage["tabslimit"];
				var keyboardshortcut = localStorage["keyboardshortcut"];

				var checkbox_openyoutubelinks = document.getElementById("openyoutubelinks");
				var radio_nonstandardlinks = document.forms.nonstandardlinks.elements.linkhandle;
				var checkbox_openvisitedlinks = document.getElementById("openvisitedlinks");
				var checkbox_opennsfwlinks = document.getElementById("opennsfwlinks");
				var input_tabslimit = document.getElementById("tabslimit");
				var input_keyboardshortcut = document.getElementById("keyboardshortcut");

				checkbox_openyoutubelinks.checked = (openyoutubelinks == "true");
				radiotoset = document.getElementById(nonstandardlinks);
				radiotoset.checked = true;
				checkbox_openvisitedlinks.checked = (openvisitedlinks == "true");
				checkbox_opennsfwlinks.checked = (opennsfwlinks == "true");
				input_tabslimit.value = tabslimit;
				input_keyboardshortcut.value = keyboardshortcut;
			}
			
function clickHandler(e) {
  setTimeout(save_options, 0);
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('button').addEventListener('click', clickHandler);
  restore_options();
});