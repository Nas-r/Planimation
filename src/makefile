# Set the source directory
jsdir = js/

# Create the list of modules
modules =	${jsdir}core.js\
					${jsdir}input_options_objects.js\
					${jsdir}input_form_selector.js\
					${jsdir}input_form.js\
					${jsdir}animation_function_definitions.js\
					${jsdir}generate_animation_timeline.js\
					${jsdir}save_options.js\
					${jsdir}load_options.js

# Concat all of the modules into planimation-dev.js
planimation-dev.js: ${modules}
	cat $^ > $@
