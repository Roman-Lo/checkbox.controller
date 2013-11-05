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
		this.checkboxStatusAttr = "check-status"
		this.checkboxStatus = {
			checked : 'cc-checked'
			, nonchecked : 'cc-no-checked'
			, partialchecked : 'cc-partial-checked'
		}
		this.type = undefined
		this.enabled = undefined
		this.totalAmount = 0
		this.checkedAmount = 0
		this.$element = null
		this.$checkboxes = null
		this.options = {}
		this.totalMs = 0
		this.times = 0
		this.init('checkboxController', element, options)
	}
	
	CheckboxController.DEFAULTS = {
		checkboxes : undefined	//jQuery style selector
		, styles : {
			allChecked : 'ui-check-all' //use on header (not checkboxes)
			, partialChecked : 'ui-check-partial' //use on header (not checkboxes)
			, noneChecked : 'ui-check-none' //use on header (not checkboxes)
			, normalChecked : 'ui-check-nor-all' //use on checkboxes (not header)
			, normalNoneChecked : 'ui-check-nor-none' //use on checkboxes (not header)
		}
		, strictCheckbox : true // true: all checkboxes are trodictional input checkboxes, false: checkboxex are base on a picture/icon and not an input element
		, safeMode : true // using absolute length instead of counting (in case of improper trigger use out side)
		, fastMode : true // fast mode enable to add extra attribute to checkbox header and checkboxes to identify the status (when fastMode turned on, safeMode will be auto turn on)
		, debug : false
	}

	CheckboxController.prototype.init = function(type, element, options){
		this.enabled = true
		this.type = type
		this.$element = $(element)
		this.options = this.getOptions(options)

		if (!this.options){
			throw new Error('checkboxes class selector is undefined')
			return
		}

		if (!this.options.safeMode && this.options.fastMode) {
			this.options.safeMode = true
			if (this.options.debug) {
				console.warn('Notice: Safe mode auto turned on!');
			}
		}

		this.$checkboxes = $(this.options['checkboxes'])

		if (this.options.fastMode) {
			//init the status of the checkbox header when fast mode turned on
			this.$element.attr(this.checkboxStatusAttr, this.checkboxStatus.nonchecked)
		}

		for (var i = this.$checkboxes.length - 1; i >= 0; i--) {
			var chkBxItm = this.$checkboxes[i]
			var $chkBxItm = $(chkBxItm)
			
			if (this.options.strictCheckbox) {
				if (!$chkBxItm.is('input') || $chkBxItm.attr('type') != 'checkbox') continue
				
				if (this.options.fastMode) {
					$chkBxItm.attr(this.checkboxStatusAttr, chkBxItm.checked ? this.checkboxStatus.checked : this.checkboxStatus.nonchecked)
				}

				this.checkedAmount += chkBxItm.checked ? 1 : 0

			} else {
				throw new Error('the current version of CheckboxController is not support in-strictCheckbox')
				break;				
			}

			this.totalAmount += 1
		}

		this.refreshControllerState()

		if (this.totalAmount == 0){
			//there is no checkboxes
			this.checkedAmount = -1
			this.totalAmount = -1
		} else {
			//register event	
			var that = this
			if (this.options.strictCheckbox) {
				this.$checkboxes.on('change', function (ele, isBatching) {		
					var $this = $(ele.target)
					if (!$this.is('input') || $this.attr('type') != 'checkbox') return
					if (!isBatching) {
						if (that.options.fastMode) {
							$this.attr(that.checkboxStatusAttr, this.checked ? that.checkboxStatus.checked : that.checkboxStatus.nonchecked)
						}
						if (that.options.safeMode) {
							that.checkedAmount = !that.options.fastMode 
								? that.$checkboxes.filter(':checked').length 
								: $(that.options.checkboxes+"["+that.checkboxStatusAttr+"="+that.checkboxStatus.checked+"]").length
						} else {
							that.checkedAmount += this.checked ? 1 : -1
						}
						that.refreshControllerState()
					}
				})
			} else {
				throw new Error('the current version of CheckboxController is not support in-strictCheckbox')
				return
			}
			
			this.$element.on('click', function() {				
				var startTime = new Date().getTime()
				that.times += 1
				if (that.totalAmount == that.checkedAmount) {
					that.batchCheckboxesState(false)
				} else {
					that.batchCheckboxesState(true)
				}
				that.totalMs += (new Date().getTime() - startTime)
				if (that.options.debug) {
					console.info('Batching end: '+that.times+' times avg. cost:' + (that.totalMs / that.times) + 'ms')
				}
			}).on('batch-change', function() {
				if (that.options.strictCheckbox) {
					if (that.options.safeMode) {
						that.checkedAmount = !that.options.fastMode 
							? that.$checkboxes.filter(':checked').length 
							: $(that.options.checkboxes+"["+that.checkboxStatusAttr+"="+that.checkboxStatus.checked+"]").length
					} 
					//trigger change
					//setTimeout(function(){
						that.$checkboxes.trigger('change', true);
					//}, 100)
				} else {
					throw new Error('the current version of CheckboxController is not support in-strictCheckbox')
					return
				}				 				
				that.refreshControllerState()				
			})
		}
	}

	CheckboxController.prototype.batchCheckboxesState = function (checked) {		
		if (this.options.strictCheckbox) {
			if (this.options.fastMode) {		
				//alert(this.$checkboxes.filter("["+this.checkboxStatusAttr+"="+(checked ? this.checkboxStatus.nonchecked : this.checkboxStatus.checked)+"]").length)		
				this.$checkboxes.filter("["+this.checkboxStatusAttr+"="+(checked ? this.checkboxStatus.nonchecked : this.checkboxStatus.checked)+"]").each(function(){
					this.checked = checked
				})
				//batch status
				this.$checkboxes.attr(this.checkboxStatusAttr, checked ? this.checkboxStatus.checked : this.checkboxStatus.nonchecked)
			} else {		
				var that = this		
				this.$checkboxes.filter(checked ? 'input:checkbox:not(:checked)' : ':checked').each(function(){			
					this.checked = checked
					if (!that.options.safeMode) {
						that.checkedAmount += this.checked ? 1 : -1;
					}
					//$(this).trigger('change', true);
				})
			}			
		} else {
			throw new Error('the current version of CheckboxController is not support in-strictCheckbox')
			return
		}
		
		this.$element.trigger('batch-change')
	}
	
	CheckboxController.prototype.refreshControllerState = function () {
		this.clearStates()
		this.$element.addClass((this.checkedAmount == this.totalAmount) 
			? this.options.styles.allChecked 
			: (this.checkedAmount == 0) 
			? this.options.styles.noneChecked 
			: this.options.styles.partialChecked)
		if (this.options.fastMode) {
			this.$element.attr(this.checkboxStatusAttr, (this.checkedAmount == this.totalAmount) 
				? this.checkboxStatus.checked
				: (this.checkedAmount == 0) 
				? this.checkboxStatus.nonechecked 
				: this.checkboxStatus.partialchecked)
		}

	}

	CheckboxController.prototype.clearStates = function () {
		this.$element.removeClass(this.options.styles.allChecked)
			.removeClass(this.options.styles.partialChecked)
			.removeClass(this.options.styles.noneChecked)
	}

	CheckboxController.prototype.getDefaults = function () {
		return CheckboxController.DEFAULTS
	}

	CheckboxController.prototype.getOptions = function (options) {
		options = $.extend({}, this.getDefaults(), this.$element.data(), options)
		if (options.checkboxes === undefined) return false
		return options
	}


    var old = $.fn.checkboxController

	$.fn.checkboxController = function (option) {
		return this.each(function () {
			var $this   = $(this)
			var data    = $this.data('widget.checkboxController')
			var options = typeof option == 'object' && option

			if (!data) $this.data('widget.checkboxController', (data = new CheckboxController(this, options)))
			if (typeof option == 'string') data[option]()
		});
	}

	$.fn.checkboxController.Constructor = CheckboxController


	// NO CONFLICT
	// ===================

	$.fn.checkboxController.noConflict = function () {
		$.fn.checkboxController = old
		return this
	}


})(window.jQuery)