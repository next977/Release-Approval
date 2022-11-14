/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"SYNC/zdcmmui5_gisg/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
