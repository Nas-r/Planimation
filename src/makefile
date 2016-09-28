# Set the source directory
jsdir = js/
testdir =

# Create the list of modules
modules =	${jsdir}core.js\
					${jsdir}input_form_selector.js\
					${jsdir}input_options_objects.js\
					${jsdir}input_form_generator.js\
					${jsdir}animation_function_definitions.js\
					${jsdir}get_input_values.js

# Concat all of the modules into planimation-dev.js
planimation-dev.js: ${modules}
	cat $^ > $@
