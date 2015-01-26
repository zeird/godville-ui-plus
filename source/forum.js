(function() {
'use strict';

var worker = window.wrappedJSObject || window;

var i, len, follow_links, isFollowed, links_containers, topic, unfollow_links,
	isTopic, forum_topics, god_name, topics, elem;

var doc = document;
var $id = function(id) {
	return doc.getElementById(id);
};
var $C = function(classname) {
	return doc.getElementsByClassName(classname);
};
var $c = function(classname) {
	return doc.getElementsByClassName(classname)[0];
};
var $Q = function(sel) {
	return doc.querySelectorAll(sel);
};
var $q = function(sel) {
	return doc.querySelector(sel);
};
var storage = {
	_get_key: function(key) {
		return "GUIp_" + god_name + ':' + key;
	},
	set: function(id, value) {
		localStorage[this._get_key(id)] = value;
		return value;
	},
	get: function(id) {
		var value = localStorage[this._get_key(id)];
		if (value === 'true') { return true; }
		else if (value === 'false') { return false; }
		else { return value; }
	}
};
var checkHash = function() {
	// scroll to a certain post #
	var guip_hash = location.hash.match(/#guip_(\d+)/);
	if (guip_hash) {
		location.hash = $C('spacer')[+guip_hash[1]].id;
	}
};
var addSmallElements = function() {
	// add missing <small> elements
	var temp = $Q('.c2');
	for (i = 0, len = temp.length; i < len; i++) {
		if (!temp[i].querySelector('small')) {
			temp[i].insertAdjacentHTML('beforeend', '<small />');
		}
	}
};
var addLinks = function() {
	// add links
	for (i = 0, len = links_containers.length; i < len; i++) {
		topic = isTopic ? location.pathname.match(/\d+/)[0]
						: links_containers[i].parentElement.getElementsByTagName('a')[0].href.match(/\d+/)[0];
		isFollowed = topics[topic] !== undefined;
		links_containers[i].insertAdjacentHTML('beforeend',
			(isTopic ? '(' : '\n') + '<a class="follow" href="#" style="display: ' + (isFollowed ? 'none' : 'inline') + '">' + (isTopic ? worker.GUIp_i18n.Subscribe : worker.GUIp_i18n.subscribe) + '</a>' +
									 '<a class="unfollow" href="#" style="display: ' + (isFollowed ? 'inline' : 'none') + '">' + (isTopic ? worker.GUIp_i18n.Unsubscribe : worker.GUIp_i18n.unsubscribe) + '</a>' + (isTopic ? ')' : '')
		);
	}
	addClickToFollow();
	addClickToUnfollow();
};
var followClick = function(e) {
	try {
		e.preventDefault();
		var topic = isTopic ? location.pathname.match(/\d+/)[0]
							: this.parentElement.parentElement.querySelector('a').href.match(/\d+/)[0],
			posts = isTopic ? +$c('subtitle').textContent.match(/\d+/)[0]
							: +this.parentElement.parentElement.nextElementSibling.textContent,
			topics = JSON.parse(storage.get(forum_topics));
		topics[topic] = posts;
		storage.set(forum_topics, JSON.stringify(topics));
		this.style.display = 'none';
		this.parentElement.querySelector('.unfollow').style.display = 'inline';
	} catch(error) {
		worker.console.error(error);
	}
};
var addClickToFollow = function() {
	// add click events to follow links
	follow_links = $Q('.follow');
	for (i = 0, len = follow_links.length; i < len; i++) {
		follow_links[i].onclick = followClick;
	}
};
var unfollowClick = function(e) {
	try {
		e.preventDefault();
		var topic = isTopic ? location.pathname.match(/\d+/)[0]
							: this.parentElement.parentElement.querySelector('a').href.match(/\d+/)[0],
			topics = JSON.parse(storage.get(forum_topics));
		delete topics[topic];
		storage.set(forum_topics, JSON.stringify(topics));
		this.style.display = 'none';
		this.parentElement.querySelector('.follow').style.display = 'inline';
	} catch(error) {
		worker.console.error(error);
	}
};
var addClickToUnfollow = function() {
	// add click events to unfollow links
	unfollow_links = $Q('.unfollow');
	for (i = 0, len = unfollow_links.length; i < len; i++) {
		unfollow_links[i].onclick = unfollowClick;
	}
};

function GUIp_forum() {
try {

if (!worker.GUIp_i18n || !worker.GUIp_browser || !worker.GUIp_addCSSFromURL) { return; }
clearInterval(starter);

isTopic = location.pathname.match(/topic/) !== null;
forum_topics = 'Forum' + (isTopic ? $q('.crumbs a:nth-child(3)').href.match(/forums\/show\/(\d+)/)[1]
								  : location.pathname.match(/forums\/show\/(\d+)/)[1]);
god_name = localStorage.GUIp_CurrentUser;
topics = JSON.parse(storage.get(forum_topics));

if (isTopic) {
	links_containers = $Q('#topic_mod');
} else {
	addSmallElements();
	links_containers = $Q('.c2 small');
}

addLinks();

if (isTopic) {
	checkHash();
	// formatting buttons
	var $reply_form = $id('post_body_editor');
	worker.GUIp_addCSSFromURL(worker.GUIp_getResource('forum.css'), 'forum_css');
	var formatting_buttons =
		'<a class="formatting button bold" title="' + worker.GUIp_i18n.bold_hint + '">' + worker.GUIp_i18n.bold + '</a>' +
		'<a class="formatting button underline" title="' + worker.GUIp_i18n.underline_hint + '">' + worker.GUIp_i18n.underline + '</a>' +
		'<a class="formatting button strike" title="' + worker.GUIp_i18n.strike_hint + '">' + worker.GUIp_i18n.strike + '</a>' +
		'<a class="formatting button italic" title="' + worker.GUIp_i18n.italic_hint + '">' + worker.GUIp_i18n.italic + '</a>' +
		'<blockquote class="formatting bq" title="' + worker.GUIp_i18n.quote_hint + '">bq.</blockquote>' +
		'<pre class="formatting bc" title="' + worker.GUIp_i18n.code_hint + '"><code>bc.</code></pre>' +
		(worker.GUIp_locale === 'ru' ? '<a class="formatting button godname" title="Вставить ссылку на бога"></a>' : '') +
		'<a class="formatting button link" title="' + worker.GUIp_i18n.link_hint + '">a</a>' +
		'<a class="formatting button ul" title="' + worker.GUIp_i18n.unordered_list_hint + '">•</a>' +
		'<a class="formatting button ol" title="' + worker.GUIp_i18n.ordered_list_hint + '">1.</a>' +
		'<a class="formatting button br" title="' + worker.GUIp_i18n.br_hint + '">\\n</a>' +
		'<a class="formatting button sup" title="' + worker.GUIp_i18n.sup_hint + '">X<sup>2</sup></a>' +
		'<a class="formatting button sub" title="' + worker.GUIp_i18n.sub_hint + '">X<sub>2</sub></a>' +
		'<a class="formatting button monospace" title="' + worker.GUIp_i18n.monospace_hint + '"><code>' + worker.GUIp_i18n.monospace + '</code></a>';
	$reply_form.insertAdjacentHTML('afterbegin', formatting_buttons);
	var val, ss, se, nls, nle, selection;
	var init_editor = function(editor) {
		val = editor.value;
		ss = editor.selectionStart;
		se = editor.selectionEnd;
		selection = worker.getSelection().isCollapsed ? '' : worker.getSelection().toString().trim();
	};
	var putSelectionTo = function(editor, pos, quoting) {
		editor.focus();
		editor.selectionStart = editor.selectionEnd = pos + (quoting ? selection.length : 0);
	};
	var basic_formatting = function(left_and_right, editor) {
		try {
			init_editor(editor);
			while (ss < se && val[ss].match(/[^\wА-Яа-я]/)) {
				ss++;
			}
			while (ss < se && val[se - 1].match(/[^\wА-Яа-я]/)) {
				se--;
			}
			editor.value = val.slice(0, ss) + (val && val[ss - 1] && !val[ss - 1].match(/[^\wА-Яа-я]/) ? ' ' : '') + left_and_right[0] + val.slice(ss, se) + selection + left_and_right[1] + (val && val [se] && !val[se].match(/[^\wА-Яа-я]/) ? ' ' : '') + val.slice(se);
			putSelectionTo(editor, se + left_and_right[0].length, true);
			return false;
		} catch(error) {
			worker.console.error(error);
		}
	};
	var quote_formatting = function(quotation, editor) {
		try {
			init_editor(editor);
			nls = val && val[ss - 1] && !val[ss - 1].match(/\n/) ? '\n\n' : (val[ss - 2] && !val[ss - 2].match(/\n/) ? '\n' : '');
			nle = val && (val[se] && !val[se].match(/\n/) || !val[se]) ? '\n\n' : (val[se + 1] && !val[se + 1].match(/\n/) ? '\n' : '') +
			      selection && !selection[selection.length - 1].match(/\n/) ? '\n\n' : (selection[selection.length - 2] && !selection[selection.length - 2].match(/\n/) ? '\n' : '');
			editor.value = val.slice(0, ss) + nls + quotation + val.slice(ss, se) + selection + nle + val.slice(se);
			putSelectionTo(editor, se + quotation.length + nls.length + (se > ss || selection ? nle.length : 0), true);
		} catch(error) {
			worker.console.error(error);
		}
	};
	var list_formatting = function(list_marker, editor) {
		try {
			init_editor(editor);
			nls = val && val[ss - 1] && !val[ss - 1].match(/\n/) ? '\n' : '';
			nle = val && val[se] && !val[se].match(/\n/) ? '\n\n' : (val[se + 1] && !val[se + 1].match(/\n/) ? '\n' : '');
			var count = val.slice(ss, se).match(/\n/g) ? val.slice(ss, se).match(/\n/g).length + 1 : 1;
			editor.value = val.slice(0, ss) + nls + list_marker + ' ' + val.slice(ss, se).replace(/\n/g, '\n' + list_marker + ' ') + nle + val.slice(se);
			putSelectionTo(editor, se + nls.length + (list_marker.length + 1)*count, true);
		} catch(error) {
			worker.console.error(error);
		}
	};
	var paste_br = function(dummy, editor) {
		try {
			init_editor(editor);
			var pos = editor.selectionDirection === 'backward' ? ss : se;
			editor.value = val.slice(0, pos) + '<br>' + val.slice(pos);
			putSelectionTo(editor, pos + 4, true);
		} catch(error) {
			worker.console.error(error);
		}
	};
	var set_click_actions = function(id, container) {
		var temp = '#' + id + ' .formatting.',
			buttons = [
				{ class: 'bold', func: basic_formatting, params: ['*', '*'] },
				{ class: 'underline', func: basic_formatting, params: ['+', '+'] },
				{ class: 'strike', func: basic_formatting, params: ['-', '-'] },
				{ class: 'italic', func: basic_formatting, params: ['_', '_'] },
				{ class: 'godname', func: basic_formatting, params: ['"', '":пс'] },
				{ class: 'link', func: basic_formatting, params: ['"', '":'] },
				{ class: 'sup', func: basic_formatting, params: ['^', '^'] },
				{ class: 'sub', func: basic_formatting, params: ['~', '~'] },
				{ class: 'monospace', func: basic_formatting, params: ['@', '@'] },
				{ class: 'bq', func: quote_formatting, params: 'bq. ' },
				{ class: 'bc', func: quote_formatting, params: 'bc. ' },
				{ class: 'ul', func: list_formatting, params: '*' },
				{ class: 'ol', func: list_formatting, params: '#' },
				{ class: 'br', func: paste_br, params: null },
			];
		for (i = 0, len = buttons.length; i < len; i++) {
			if ((elem = $q(temp + buttons[i].class))) {
				elem.onclick = buttons[i].func.bind(this, buttons[i].params, container);
			}
		}
	};
	set_click_actions('post_body_editor', $id('post_body'));
	
	var editFormObserver = new MutationObserver(function(mutations) {
		mutations.forEach(function() {
			if ($id('edit_body_editor') && !$q('#edit_body_editor .formatting.button.bold')) {
				$id('edit_body_editor').insertAdjacentHTML('afterbegin', formatting_buttons);
				set_click_actions('edit_body_editor', $id('edit_body'));
			}
		});
	});
	editFormObserver.observe($id('content'), { childList: true, subtree: true });

	// page wrapper padding fix
	var pw_pb_int, step, old_height, pw = document.getElementById('page_wrapper');
	var set_pw_pb = function(el) {
		var form = document.getElementById(el) || el;
		old_height = parseFloat(getComputedStyle(form).height) || 0;
		step = 0;
		clearInterval(pw_pb_int);
		pw_pb_int = setInterval(function() {
			if (step++ >= 100) {
				clearInterval(pw_pb_int);
			} else {
				var diff = (parseFloat(getComputedStyle(form).height) || 0) - old_height;
				old_height += diff;
				pw.style.paddingBottom = ((parseFloat(pw.style.paddingBottom) || 0) + diff) + 'px';
				worker.scrollTo(0, worker.scrollY + diff);
			}
		}, 10);
	};
	worker.Effect.old_toggle = worker.Effect.toggle;
	worker.Effect.toggle = function(a, b) { set_pw_pb(a); worker.Effect.old_toggle(a, b); };
	worker.Effect.old_BlindDown = worker.Effect.BlindDown;
	worker.Effect.BlindDown = function(a, b) { set_pw_pb(a); worker.Effect.old_BlindDown(a, b); };
	worker.EditForm.old_hide = worker.EditForm.hide;
	worker.EditForm.hide = function(dummy) { pw.style.paddingBottom = '0px'; worker.EditForm.old_hide(); };
	worker.EditForm.old_setReplyId = worker.EditForm.setReplyId;
	worker.EditForm.setReplyId = function(a) { if (document.getElementById('reply').style.display !== 'none') { pw.style.paddingBottom = '0px'; } worker.EditForm.old_setReplyId(a); };

	// godname paste fix
	worker.ReplyForm.add_name = function(name) {
		try {
			var editor;
			if (document.getElementById('edit').style.display !== 'none' && document.getElementById('edit_body')) {
				editor = document.getElementById('edit_body');
			} else {
				editor = document.getElementById('post_body');
				if (document.getElementById('reply').style.display === 'none') {
					worker.ReplyForm.init();
				}
			}
			init_editor(editor);
			var pos = editor.selectionDirection === 'backward' ? ss : se;
			editor.value = val.slice(0, pos) + '*' + name + '*, ' + val.slice(pos);
			setTimeout(function() {
				putSelectionTo(editor, pos + name.length + 4, false);
			}, 50);
		} catch(error) {
			worker.console.error(error);
		}
	};

	// pictures autopaste
	if (!storage.get('Option:disableLinksAutoreplace')) {
		var links = document.querySelectorAll('.post .body a'),
			imgs = [],
			img_onerror = function(i) {
				links[i].removeChild(links[i].getElementsByTagName('img')[0]);
				imgs[i] = undefined;
			},
			img_onload = function(i) {
				links[i].removeChild(links[i].getElementsByTagName('img')[0]);
				var hint = links[i].innerHTML;
				links[i].outerHTML = '<div class="img_container"><a id="link' + i + '" href="' + links[i].href + '" target="_blank" alt="Откроется в новой вкладке"></a><div class="hint">' + hint + '</div></div>';
				imgs[i].alt = hint;
				var new_link = document.getElementById('link' + i);
				new_link.appendChild(imgs[i]);
			};
		for (i = 0, len = links.length; i < len; i++) {
			links[i].insertAdjacentHTML('beforeend', '<img src="http://godville.net/images/spinner.gif">');
			imgs[i] = document.createElement('img');
			imgs[i].onerror = img_onerror.bind(null, i);
			imgs[i].onload = img_onload.bind(null, i);
			imgs[i].src = links[i].href;
		}
	}
}

} catch(e) {
	worker.console.error(e);
}
}
var starter = setInterval(GUIp_forum, 100);
})();