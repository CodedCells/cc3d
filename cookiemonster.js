function setCookie(name, value, days) {
	var expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Function to get a cookie by name
function getCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) === ' ') c = c.substring(1);
		if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
	}
	return null;
}

function safetypass() {
	setCookie("cookieConsent", "true", 365); // Cookie valid for 1 year
	document.getElementById("safetyCheck").style.display = "none";
	run();
}

function makeConsent(parentElement) {
	// Create the inner container with class 'check-inner'
	const checkInnerDiv = document.createElement('div');
	checkInnerDiv.className = 'check-inner';

	// Create the <h1> element with text content
	const heading1 = document.createElement('h1');
	heading1.textContent = 'CodedCells\' Scene Loader';

	// Create the <p> element with text and line break
	const paragraph = document.createElement('p');
	paragraph.innerHTML = 'This website contains material suitable only for Adults, <br>to continue please answer truthfully.';

	// Create the <h2> element with text content
	const heading2 = document.createElement('h2');
	heading2.textContent = 'Are you over 18?';

	// Create the 'Yes' button with onclick event to call safetypass()
	const yesButton = document.createElement('button');
	yesButton.textContent = 'Yes';
	yesButton.onclick = safetypass;

	// Create the 'No' button with onclick event to redirect to a URL
	const noButton = document.createElement('button');
	noButton.textContent = 'No';
	noButton.onclick = function () {
	window.location = 'https://www.rfc-editor.org/rfc/rfc2324';
	};

	// Append all created elements to the inner container
	checkInnerDiv.appendChild(heading1);
	checkInnerDiv.appendChild(paragraph);
	checkInnerDiv.appendChild(heading2);
	checkInnerDiv.appendChild(yesButton);
	checkInnerDiv.appendChild(noButton);

	// Append the inner container to the main container
	parentElement.appendChild(checkInnerDiv);
	parentElement.style.display = "";
}

var consent = getCookie("cookieConsent");
if (consent == "true")
	run()
else
	makeConsent(document.getElementById("safetyCheck"))