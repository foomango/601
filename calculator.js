(function ($) {
    if (!$.calc) {
        $.calc = {};
    }
    
    var View = function () {
        function v() {
            this.root = $(".calc");
        }
        
        v.prototype.init = function () {
            var p = this;
            
            this.reset(this.root.find("#btn-reset"));
            
            this.root.on("click", "#btn-reset", function () {
                p.reset(this);
            });
            
            this.root.on("click", "#btn-calc", function () {
                var input, output;
                input = p.collectInput(p.root);
                output = Model.calc(input);
                p.renderOutput(output);
            });
        };
        
        v.prototype.reset = function (button) {
            $(button).parents(".calc").find("td .items, td .total, td .balance").val('0').text('0');
        };
        
        v.prototype.collectInput = function (calcWrap) {
            var input, output, summary;
            
            input = [];
            calcWrap.find("tbody tr").each(function () {
                var e = {};
                e.row = this;
                e.items = $(this).find(".items").val().split((/[^(\d|\.|\-)]/));
                input.push(e);
            });
            
            summary = {};
            summary.total = parseFloat(calcWrap.find("#summary .total").val());
            if (isNaN(summary.total)) {
                summary.total = -1;
            }
            output = {};
            output.input = input;
            output.summary = summary;
            
            return output;
        };
        
        v.prototype.renderOutput = function (output) {
            var list, i, summaryWrap;
            
            list = output.input;
            for (i = 0; i < list.length; i++) {
                var rowWrap = $(list[i].row);
                rowWrap.find(".total").text(list[i].subTotal.toFixed(2));
                rowWrap.find(".balance").text(list[i].balance.toFixed(2));
            }

            summaryWrap = this.root.find("#summary");
            if (output.summary.isValid) {
                summaryWrap.find(".total").removeClass("warning");
                summaryWrap.find(".items").text(output.summary.common.toFixed(2));
                summaryWrap.find(".balance").text(output.summary.shared.toFixed(2));
            } else {
                summaryWrap.find(".total").addClass("warning");
                summaryWrap.find(".items").text('N/A');
                summaryWrap.find(".balance").text('N/A');
            }
        };
        
        return v;
    }();
    
    var Model = function () {
        function v() {
            
        }
        
        v.calc = function (output) {
            var i, j, total, input, average, totalPayed, avgShared;
            
            totalPayed = 0;
            total = 0;
            input = output.input;
            
            for (i = 0; i < input.length; i++) {
                var num;
                input[i].subTotal = 0;
                input[i].payed = 0;
                for (j = 0; j < input[i].items.length; j++) {
                    num = parseFloat(input[i].items[j]);
                    if (!isNaN(num)) {
                        if (num > 0) {
                            input[i].subTotal += num;
                        } else {
                            input[i].payed -= num;
                        }
                    }
                }
                total+= input[i].subTotal;
                totalPayed += input[i].payed;
            }
            
            avgShared = (total - totalPayed) / input.length;
            
            for (i = 0; i < input.length; i++) {
                input[i].balance = input[i].payed + avgShared - input[i].subTotal;
            }
            
            if (output.summary.total < 0 || output.summary.total < total) {
                output.summary.isValid = false;
            } else {
                output.summary.isValid = true;
                output.summary.common = output.summary.total - total;
                output.summary.shared = output.summary.total - totalPayed;
            }
            
            return output;
        };
        
        return v;
    }();
    
    $(function () {
        $.calc.ui = new View();
        $.calc.ui.init();
    });
})(jQuery);
