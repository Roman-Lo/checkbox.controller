/**
 * CheckboxController.js [dev. version 0.0.1]
 *
 * Copyright (c) 2013 Roman Lo and other contributors
 * Released under the MIT license
 * Date: 2013-11-04
 * 
 */
if (!jQuery) { throw new Error("Checkbox Controller requires jQuery") }

+(function($) {
	
	var CheckboxController = function(element, options){	
		this.type = undefined;
		this.enabled = undefined;
		this.totalAmount = 0;
		this.checkedAmount = 0;		
		this.$element = null;
		this.$checkboxes = null;
		this.options = {};
		this.totalMs = 0;
		this.times = 0;				
		this.init('checkboxController', element, options);
	}
	
	CheckboxController.DEFAULTS = {		
		checkboxes : undefined	//class selector
		, styles : {
			allChecked : ''
			, partialChecked : ''
			, noneChecked : ''
			, normalChecked : undefined
			, normalNoneChecked : undefined
		}
		, debug : false
		, safeMode : true
	}

	CheckboxController.prototype.init = function(type, element, options){
		this.enabled = true;
		this.type = type;
		this.$element = $(element);
		this.options = this.getOptions(options);
		if (!this.options){
			throw new Error('checkboxes class selector is undefined');
			return;
		}

		this.$checkboxes = $("."+this.options['checkboxes']);
		for (var i = this.$checkboxes.length - 1; i >= 0; i--) {
			var chkBxItm = this.$checkboxes[i];
			var $chkBxItm = $(chkBxItm);
			
			if(!$chkBxItm.is('input') || $chkBxItm.attr('type') != 'checkbox') continue;

			this.checkedAmount += chkBxItm.checked ? 1 : 0;
			this.totalAmount += 1;
		};

		this.refreshControllerState();

		if (this.totalAmount == 0){
			//there is no checkboxes
			this.checkedAmount = -1;
			this.totalAmount = -1;
		} else {
			//register event	
			var that = this;		
			this.$checkboxes.on('change', function (ele, isBatching) {		
				var $this = $(ele);		
				if(!$this.is('input') || $this.attr('type') != 'checkbox') return;			
				if(!isBatching){
					if(this.options.safeMode){
						that.checkedAmount = that.$checkboxes.filter(':checked').length;
					}else{
						that.checkedAmount += that.checked ? 1 : -1;
					}
					that.refreshControllerState();
				}
			});
			this.$element.on('click', function() {				
				var startTime = new Date().getTime();
				that.times += 1;
				if (that.totalAmount == that.checkedAmount) {
					that.batchCheckboxesState(false);
				} else {
					that.batchCheckboxesState(true);
				}
				that.totalMs += (new Date().getTime() - startTime);
				if (that.options.debug) {
					console.info('Batching end: '+that.times+' times avg. cost:' + (that.totalMs / that.times) + 'ms');
				}
			}).on('batch-change', function() {
				that.checkedAmount = that.$checkboxes.filter(':checked').length;
				that.refreshControllerState();
				//trigger change
				setTimeout(function(){
					that.checkboxes.trigger('change', true);
				}, 100);
			});
		}
	}

	CheckboxController.prototype.batchCheckboxesState = function (checked) {		
		this.$checkboxes.filter(checked ? 'input:checkbox:not(:checked)' : ':checked').each(function(){			
			this.checked = checked;			
			//$(this).trigger('change', true);
		});		
		this.$element.trigger('batch-change');
	}
	
	CheckboxController.prototype.refreshControllerState = function () {
		this.clearStates();
		this.$element.addClass((this.checkedAmount == this.totalAmount) ? this.options.styles.allChecked : 
				(this.checkedAmount == 0) ? this.options.styles.noneChecked : this.options.styles.partialChecked);
	}

	CheckboxController.prototype.clearStates = function () {
		this.$element.removeClass(this.options.styles.allChecked)
			.removeClass(this.options.styles.partialChecked)
			.removeClass(this.options.styles.noneChecked);
	}

	CheckboxController.prototype.getDefaults = function () {
		return CheckboxController.DEFAULTS;
	}

	CheckboxController.prototype.getOptions = function (options) {
		options = $.extend({}, this.getDefaults(), this.$element.data(), options);		
		if (options.checkboxes === undefined) return false;
		return options;
	}


  	var old = $.fn.checkboxController;

	$.fn.checkboxController = function (option) {
		return this.each(function () {
			var $this   = $(this);
			var data    = $this.data('widget.checkboxController');
			var options = typeof option == 'object' && option;

			if (!data) $this.data('widget.checkboxController', (data = new CheckboxController(this, options)));
			if (typeof option == 'string') data[option]();
		});
	}

	$.fn.checkboxController.Constructor = CheckboxController;


	// NO CONFLICT
	// ===================

	$.fn.checkboxController.noConflict = function () {
		$.fn.checkboxController = old;
		return this;
	}


})(window.jQuery);