# Set the source directory
jsdir = js/
jisondir = jison/

# Create the list of modules
modules =	${jsdir}core.js\
					${jsdir}input_form_selector.js\
					${jsdir}input_options_objects.js\
					${jsdir}input_form_generator.js\
					${jsdir}input_form_submit.js

# Compress all of the modules into spark.js
planimation-dev.js: ${modules}
	cat $^ > $@
