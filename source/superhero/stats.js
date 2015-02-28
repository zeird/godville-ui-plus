// ui_stats
var ui_stats = window.wrappedJSObject ? createObjectIn(worker.GUIp, {defineAs: "stats"}) : worker.GUIp.stats = {};

ui_stats.get = function(key) {
	return ui_storage.get('Stats:' + key);
};
ui_stats.set = function(key, value) {
	return ui_storage.set('Stats:' + key, value);
};
ui_stats.setFromLabelCounter = function(id, $container, label, parser) {
	parser = parser || parseInt;
	var $label = ui_utils.findLabel($container, label);
	var $field = $label.siblings('.l_val');
	var value = parser($field.text());
	if (id === 'Bricks' || id === 'Logs') { return ui_stats.set(id, Math.floor(value*10 + 0.5)); }
	else { return ui_stats.set(id, value); }
};