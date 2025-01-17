/* global requirejs cprequire cpdefine chilipeppr */

// Load additional files via Chilipeppr's require.js
requirejs.config({
    paths: {
        jqueryui: '//i2dcui.appspot.com/js/jquery-ui-1.10.4/ui/jquery.ui.core',
        jqueryuiWidget: '//i2dcui.appspot.com/js/jquery-ui-1.10.4/ui/jquery.ui.widget',
        jqueryuiMouse: '//i2dcui.appspot.com/js/jquery-ui-1.10.4/ui/jquery.ui.mouse',
        jqueryuiResizeable: '//i2dcui.appspot.com/js/jquery-ui-1.10.4/ui/jquery.ui.resizable',
    },
    shim: {
        jqueryuiWidget: ['jqueryui'],
        jqueryuiMouse: ['jqueryuiWidget'],
        jqueryuiResizeable: ['jqueryuiMouse']
    }
});

// Test this element. This code is auto-removed by the chilipeppr.load()
cprequire_test(["inline:com-chilipeppr-widget-spconsole"], function(sp) {
    console.log("test running of " + sp.id);
    
    $('body').css("padding", "20px");

    var singlePortMode = true;

    var test = function() {
        
        var ctr = 0;
        
        if (singlePortMode) {

            // sample sending of data, perhaps from another widget, or from
            // ourselves
            // /com-chilipeppr-widget-serialport/send  data: G91 G1 Y0.001 F100\nG90\n
            setTimeout(function() {
                chilipeppr.publish("/com-chilipeppr-widget-serialport/jsonSend", {
                    D: 'G91 G1 Y0.001 F100\nG90\n',
                    Id: "g1"
                });
            }, 1000);
            
            // setInterval(function() {
            //     chilipeppr.publish("/com-chilipeppr-widget-serialport/jsonSend", {
            //         D: '$G\n',
            //         Id: "g" + ctr++
            //     });
            // }, 2000);

            setTimeout(function() {
                chilipeppr.publish("/com-chilipeppr-widget-serialport/recvline", {
                    dataline: 'G91 G1 Y10.001 F100\nG90\n'
                });
            }, 2000);

            // sample recvline from the serial port
            setTimeout(function() {
                chilipeppr.publish("/com-chilipeppr-widget-serialport/recvline", {
                    dataline: '{"sr":{"vel":0.02,"mpox":10.474,"dist":1,"stat":5}}\n'
                });
            }, 3000);

            setTimeout(function() {
                for (var ctr = 0; ctr < 20; ctr++) {
                    chilipeppr.publish("/com-chilipeppr-widget-serialport/send", 'G91 G1 Y0.001 F100\nG90\n');
                    chilipeppr.publish("/com-chilipeppr-widget-serialport/recvline", {
                        dataline: '{"sr":{"vel":0.02,"mpox":10.474,"dist":1,"stat":5}}\n'
                    });

                }
            }, 3500);

            sp.init(true, /^{/);

        }
        else {
            sp.portBoundTo = {
                Name: "COM21"
            };
            setTimeout(function() {
                chilipeppr.publish("/com-chilipeppr-widget-serialport/ws/recv", JSON.stringify({
                    "P": "COM21",
                    "D": ".\r\nd0\u0009drdy off\r\nFreeRam after setup: 1111\r\nsadfa\r\nasdfasdf\r\rwwwwww\r\n"
                }));
                console.log("just did fake publish to test");
            }, 2000);
            sp.init();
        }
    }
    test();
    //sp.init(true, /^{/);
    
    // test a recvSingleSelectPort
    // var testRecvPortChange = function() {
    //     chilipeppr.publish("/com-chilipeppr-widget-serialport/recvSingleSelectPort",  {Name: "COM4", Friendly: "NodeMCU / CP2102 (COM4)", SerialNumber: "USB\VID_10C4&PID_EA60\014ADB5C", DeviceClass: "", IsOpen: true, …});
    // }
    
    // Inject new div to contain widget or use an existing div with an ID
    $("body").append('<p></p><' + 'div id="myDivWidgetSerialport"><' + '/div>');
    
    chilipeppr.load(
      "#myDivWidgetSerialport",
      "http://raw.githubusercontent.com/chilipeppr/widget-spjs/master/auto-generated-widget.html",
      function() {
        // Callback after widget loaded into #myDivWidgetSerialport
        // Now use require.js to get reference to instantiated widget
        cprequire(
          ["inline:com-chilipeppr-widget-serialport"], // the id you gave your widget
          function(spjs) {
            // Callback that is passed reference to the newly loaded widget
            console.log("Widget / Serial Port JSON Server just got loaded.", spjs);
            spjs.setSingleSelectMode();
            spjs.init();
          }
        );
      }
    );
    
    setTimeout(function() {
        sp.setFilter(/^ok|^\n|^\[G|^<|\$G/);
    }, 10000);

} /*end_test*/ );

cpdefine("inline:com-chilipeppr-widget-spconsole", ["chilipeppr_ready", "jquerycookie", 'jqueryuiResizeable'], function() {
    return {
        id: "com-chilipeppr-widget-spconsole",
        url: "(auto fill by runme.js)",       // The final URL of the working widget as a single HTML file with CSS and Javascript inlined. You can let runme.js auto fill this if you are using Cloud9.
        fiddleurl: "(auto fill by runme.js)", // The edit URL. This can be auto-filled by runme.js in Cloud9 if you'd like, or just define it on your own to help people know where they can edit/fork your widget
        githuburl: "(auto fill by runme.js)", // The backing github repo
        testurl: "(auto fill by runme.js)",   // The standalone working widget so can view it working by itself
        name: "Widget / Serial Port Console v1.7",
        desc: "The Console widget lets you see the serial port log as well as send serial port commands into the selected serial port in the SPJS widget (the green one). There is a filter feature you can toggle in case your serial device sends large amounts of data that can overwhelm the user, but that you occasionally want to view by toggling the funnel. The console also lets you jump to previous commands using the up/down arrows in the input textbox.",
        foreignPublish: {
            '/com-chilipeppr-widget-serialport/send': "(High-level mode) When the user types a command, we send this signal so the serial port widget can pass the command along to the serial port server. This is the high-level send command that is used when in single port mode where we can ignore which serial port we are sending to and let the serial port widget figure it out. To get into this mode you must call init(true) to put this widget into singlePortMode. Optionally you can also call setSinglePortMode().",
            '/com-chilipeppr-widget-serialport/ws/send': '(Low-level mode) When the user types in a command, we send it to the serial port widget. This is the low-level command where we have to specify the serial port and the command. This happens in non-single port mode. When in single port mode, we do not send commands on this signal. We instead send a /com-chilipeppr-widget-serialport/send signal because we can then let the serial port widget decide which serial port to send to.',
            '/com-chilipeppr-widget-serialport/getlist': "(Low-level mode) When in low-level mode we must request the serial port list from the serial port widget so we can show the user which port to pick. When in single port mode, we do not use this signal because we do not have to worry about which port we are sending on."
        },
        foreignSubscribe: {
            '/com-chilipeppr-widget-serialport/recvline': "(High-level mode) When in high-level mode, i.e. setSinglePortMode(), this is the signal we receive incoming serial data on. This signal sends us data in a per-line format so we do not have to piece the data together like we do in low-level mode.",
            '/com-chilipeppr-widget-serialport/ws/recv': "(Low-level mode) When in low-level mode, this is the signal we receive the incoming serial data on. We will have to filter which data we want to show based on the port the user bound this widget to because we will get data for all connected serial ports including ones we do not want data for. It is up to this widget to decide what to show.",
            '/com-chilipeppr-widget-serialport/list': "(Low-level mode) We subscribe to this signal so we know what the list of serial ports is, so we can ask the user to bind this widget to the correct serial port. This is useful if you are instantiating this widget a couple of times or opening multiple serial ports for your app and you just want this specific widget to bind to a particular serial port. This is considered low-level mode because you have more work to do. This widget then must also send the commands using the /com-chilipeppr-widget-serialport/ws/send publish signal and specify the port and command when sending."
        },
        portBoundTo: null,
        portIsBound: false,
        isSinglePortMode: false,
        isInitted: false,
        init: function(isSinglePortMode, filterRegExp) {

            if (this.isInitted) {
                console.warn("why are we getting initted a 2nd time? huh?");
                return;
            }
            this.isInitted = true;

            //console.log("init called");
            console.group("init of serial port console");

            // we also subscribe to recvSingleSelectPort in case the user overrides
            // the single select port
            chilipeppr.subscribe("/com-chilipeppr-widget-serialport/recvSingleSelectPort", this, this.onRecvSingleSelectPort);

            // // load jquery-ui css, but make sure nobody else loaded it
            // if (!$("link[href='//code.jquery.com/ui/1.10.4/themes/smoothness/jquery-ui.css']").length)
            //     $('<link>')
            //     .appendTo('head')
            //     .attr({
            //         type: 'text/css',
            //         rel: 'stylesheet'
            //     })
            //     .attr('href', '//code.jquery.com/ui/1.10.4/themes/smoothness/jquery-ui.css');

            this.logSetup();
            this.btnBarSetup();
            this.consoleSetup();
            this.setupResizeable();
            //this.resizerSetup();
            //this.resize();
            if (isSinglePortMode) {
                this.setSinglePortMode();
            }
            else {
                this.subscribeSetup();
                this.onPortList();
            }

            // let other widgets load
            setTimeout(this.resize.bind(this), 3000);

            this.setupPauseBtn();
            this.setupClearBtn();

            // initialize popovers
            $('.com-chilipeppr-widget-spconsole [data-toggle="popover"]').popover();

            // see if instantiator wants us to apply a filter
            if (filterRegExp) {
                this.setFilter(filterRegExp)
            }
            var that = this;
            $('.com-chilipeppr-widget-spconsole .spconsole-filter').click(function() {
                // toggle filter
                that.isFilterActive = !that.isFilterActive;
                if (that.isFilterActive) {
                    $('.com-chilipeppr-widget-spconsole .spconsole-filter').addClass("active");
                }
                else {
                    $('.com-chilipeppr-widget-spconsole .spconsole-filter').removeClass("active");
                }
            });

            this.setupOnPaste();
            
            this.setupRegexpEditButtons();
            
            console.log(this.name + " done loading.");
            console.groupEnd();
        },
        setupRegexpEditButtons: function() {
            
            // setup the toggle show of the filter edit box
            $('.spconsole-filter-edit').click(() => {
                if ($('.com-chilipeppr-widget-spconsole-regexp-region').hasClass("hidden")) {
                    // the region is hidden, so show it
                    $('.com-chilipeppr-widget-spconsole .spconsole-filter-edit').addClass("active");
                    $('.com-chilipeppr-widget-spconsole-regexp-region').removeClass("hidden");
                    $('.com-chilipeppr-widget-spconsole-regexp-input').val(this.getFilter());
                    this.resize();
                } else {
                    // the region is showing, hide it
                    $('.com-chilipeppr-widget-spconsole .spconsole-filter-edit').removeClass("active");
                    $('.com-chilipeppr-widget-spconsole-regexp-region').addClass("hidden");
                    this.resize();
                }
            });
            
            // handle the "Set as Filter" button
            $('.com-chilipeppr-widget-spconsole-regexp-setbtn').click(() => {
                var newFilterTxt = $('.com-chilipeppr-widget-spconsole-regexp-input').val();
                console.log("being asked to set filter:", newFilterTxt);
                this.setFilter(newFilterTxt);
                // act as if we clicked the hide edit filter button to toggle it off
                $('.spconsole-filter-edit').click();
            });
            
        },
        // global props for filtering console
        filterRegExp: null,
        isFilterActive: false,
        setFilter: function(filterRegExp) {
            var that = this;
            console.log("they want regexp filter:", filterRegExp, "typeOf:", typeof(filterRegExp));
            
            var funnelEl = $('.com-chilipeppr-widget-spconsole .spconsole-filter');
            funnelEl.removeClass("hidden");
            funnelEl.attr('data-content', 'Toggle the filter. A filter can be applied to remove lower priority information from getting logged. The filter is set by the workspace you are in.' + 
                " The filter is set to: " + filterRegExp.toString());
            // funnelEl.data('content', "blah");
            console.log("regexp hover content", funnelEl.attr('data-content'));
            
            if (typeof(filterRegExp) == "object") {
                // we were passed a native regexp, just use
            } else {
                // we were passed a string. turn it into a regexp
                // clean up the slashes at start or end
                filterRegExp = filterRegExp.replace(/^\//, "");
                filterRegExp = filterRegExp.replace(/\/$/, "");
                filterRegExp = new RegExp(filterRegExp);
            }
            console.log("final filterRegExp:", filterRegExp);
            this.filterRegExp = filterRegExp;
            this.isFilterActive = true;
            
            // set the manual edit box
            $('.com-chilipeppr-widget-spconsole-regexp-input').val(this.filterRegExp);
            
            // attach click event
            
        },
        getFilter: function() {
            return this.filterRegExp;
        },
        setupClearBtn: function() {
            $('.com-chilipeppr-widget-spconsole .spconsole-clear').click(this.onClear.bind(this));
            //this.appendLog("asdfasdf");
        },
        onClear: function(evt) {
            console.log("onClear. evt:", evt);
            var log = this.logEls.log;
            log.html("");
        },
        setupPauseBtn: function() {
            $('.com-chilipeppr-widget-spconsole .spconsole-pause').click(this.onPause.bind(this));
        },
        isPaused: false,
        onPause: function(evt) {
            console.log("onPause. evt:", evt);

            if (this.isPaused) {
                // we are unpausing, so resubscribe
                chilipeppr.subscribe("/com-chilipeppr-widget-serialport/recvline", this, this.onRecvLine);
                this.setupJsonMode();
                $('.com-chilipeppr-widget-spconsole .spconsole-pause').removeClass('active', true);
                $('.com-chilipeppr-widget-spconsole .spconsole-pause span').removeClass('text-danger');
                this.isPaused = false;
            }
            else {
                // unsubscribe from a bunch of stuff to pause and reduce load
                // on the browser UI
                chilipeppr.unsubscribe("/com-chilipeppr-widget-serialport/recvline", this, this.onRecvLine);
                this.unsetupJsonMode();
                $('.com-chilipeppr-widget-spconsole .spconsole-pause').addClass('active', true);
                $('.com-chilipeppr-widget-spconsole .spconsole-pause span').addClass('text-danger');
                this.isPaused = true;
            }
        },
        isPasteSetup: false,
        setupOnPaste: function() {
            if (this.isPasteSetup) {
                console.warn("why are we getting setup twice for onPaste?");
                return;
            }
            this.isPasteSetup = true;
            $('#com-chilipeppr-widget-spconsole-consoleform .user-txt-input').on('paste', this.onPaste.bind(this));
        },
        onPaste: function(evt) {
            console.log("got onPaste. evt:", evt);
            var element = $(evt.currentTarget);
            setTimeout(function() {
                var text = $(element).val();
                // do something with text
                console.log("the text just pasted:", text);
                if (text.match(/[\r\n]/)) {
                	console.log("there are newlines");
                }
            }, 25);
        },
        isInJsonMode: false, // store whether we are in json mode
        isAlreadySubscribeToRecvLine: false,
        setSinglePortMode: function() {
            // in this mode we just show signals from the channel
            // /com-chilipeppr-widget-serialport/recvline 
            // we also just send on the channel
            // /com-chilipeppr-widget-serialport/send 
            // that way we don't have to know what serial port the user
            // is connected to. 
            this.isSinglePortMode = true;

            // in single port mode, we only recv serial data in line by line
            // mode (as opposed to multi-port where we get it block by block
            if (!this.isAlreadySubscribeToRecvLine) {
                chilipeppr.subscribe("/com-chilipeppr-widget-serialport/recvline", this, this.onRecvLine);
                this.isAlreadySubscribeToRecvLine = true;
            } else {
                console.warn("already subscribed to recvline in console");
            }
            
            // if another widget sends a serial cmd, echo it here
            //chilipeppr.subscribe("/com-chilipeppr-widget-serialport/send", this, this.onEchoOfSend);

            // query to see if we are at version 1.7 or above of SPJS and if so
            // use /jsonSend
            var that = this;
            var jsonModeCallback = function(data) {
                // we get this when the serial port widget tells us what mode we are in
                console.group("serial port console - jsonModeCallback");
                console.log("got data from callback:", data);

                if (data == null) {
                    // that means serial port widget not initialized yet
                    // so retry
                    console.log("data was null in jsonModeCallback. hopefully a /onportopen comes in so we know what mode we are in");
                    //, so queuing up another request for 1 second from now");
                    /*
                    setTimeout(function() {
                        console.group("jsonModeCallback retry");
                        console.log("retrying to see what the single select port is");
                        chilipeppr.subscribe("/com-chilipeppr-widget-serialport/recvSingleSelectPort", jsonModeCallback);
                        chilipeppr.publish("/com-chilipeppr-widget-serialport/requestSingleSelectPort", ""); 
                        console.groupEnd();
                    }, 1000);
                    */
                }
                else if ('Ver' in data) {
                    console.log("found we have version 1.7 or above so that's good cuz json mode is available");
                    that.isInJsonMode = true;
                    that.jsonModeSingleSelectPort = data;
                    that.setupJsonMode();
                }
                chilipeppr.unsubscribe("/com-chilipeppr-widget-serialport/recvSingleSelectPort", jsonModeCallback);
                console.groupEnd();
            };
            var onPortOpenCallback = function(data) {
                // if a port is opened, we need to requery for the single select port
                // because it could have changed
                chilipeppr.subscribe("/com-chilipeppr-widget-serialport/recvSingleSelectPort", jsonModeCallback);
                chilipeppr.publish("/com-chilipeppr-widget-serialport/requestSingleSelectPort", "");
            };

            chilipeppr.subscribe("/com-chilipeppr-widget-serialport/onportopen", onPortOpenCallback);
            chilipeppr.subscribe("/com-chilipeppr-widget-serialport/recvSingleSelectPort", jsonModeCallback);
            chilipeppr.publish("/com-chilipeppr-widget-serialport/requestSingleSelectPort", "");

            // update title of widget to reflect single port mode
            //$('.com-chilipeppr-widget-spconsole .subtitle').text("(Single Port Mode)");
            //if (this.jsonModeSingleSelectPort)
            //    $('.com-chilipeppr-widget-spconsole .subtitle').text("(" + this.jsonModeSingleSelectPort + ")");
            //else
            if (this.portBoundTo)
                $('.com-chilipeppr-widget-spconsole .subtitle').text(this.portBoundTo.Name);
            else
                $('.com-chilipeppr-widget-spconsole .subtitle').text("No port yet...");

        },
        setupJsonMode: function() {
            // if we are in json mode we need to do a few unique things
            // unsubscribe first just in case
            console.group("serial port console - setupJsonMode");
            //chilipeppr.unsubscribe("/com-chilipeppr-widget-serialport/jsonSend", this, this.jsonOnSend);
            chilipeppr.unsubscribe("/com-chilipeppr-widget-serialport/onQueue", this, this.jsonOnQueue);
            chilipeppr.unsubscribe("/com-chilipeppr-widget-serialport/onWrite", this, this.jsonOnWrite);
            chilipeppr.unsubscribe("/com-chilipeppr-widget-serialport/onComplete", this, this.jsonOnComplete);

            // 1. we subscribe to more events like /jsonOnQueue, /jsonOnWrite, /jsonOnComplete
            //chilipeppr.subscribe("/com-chilipeppr-widget-serialport/jsonSend", this, this.jsonOnSend);
            chilipeppr.subscribe("/com-chilipeppr-widget-serialport/onQueue", this, this.jsonOnQueue);
            chilipeppr.subscribe("/com-chilipeppr-widget-serialport/onWrite", this, this.jsonOnWrite);
            chilipeppr.subscribe("/com-chilipeppr-widget-serialport/onComplete", this, this.jsonOnComplete);
            
            console.groupEnd();
        },
        unsetupJsonMode: function() {
            chilipeppr.unsubscribe("/com-chilipeppr-widget-serialport/onQueue", this, this.jsonOnQueue);
            chilipeppr.unsubscribe("/com-chilipeppr-widget-serialport/onWrite", this, this.jsonOnWrite);
            chilipeppr.unsubscribe("/com-chilipeppr-widget-serialport/onComplete", this, this.jsonOnComplete);
        },
        jsonOnSend: function(data) {
            /*
            // write it to the log
            console.group("serial port console - jsonOnSend");
            console.log("data:", data);
            var arr;
            if (Array.isArray(data)) {
                // multiple cmds were sent
                arr = data;
            } else {
                // just treat single as array
                arr = [];
                arr.push(data);
            }
                
            for (var index = 0; index < arr.length; index++) {
                var item = arr[index];
                var msgEl = $(
                    "<div id=\"" + item.Id + "\" class=\"out\">" +
                    '<span class="glyphicon glyphicon-ok cmd-checkmark cmd-send"></span> ' +
                    item.D +
                    '</div>'
                );
                this.appendLog(msgEl);
            }
            console.groupEnd();
            */
        },
        jsonOnQueue: function(data) {
            //if (data.Id.length > 0)
            //    $('.com-chilipeppr-widget-spconsole-console-log #' + data.Id + " span").removeClass('cmd-send').addClass('cmd-queued');

            // write it to the log
            //console.group("serial port console - jsonOnQueue");
            console.log("serial port console. jsonOnQueue() data:", data);

            var item = data;
            var msgEl = null;
            if (item.Id.length > 0 && 'D' in data) {
                msgEl = $(
                    "<div id=\"" + item.Id + "\" class=\"out\">" +
                    '<span class="glyphicon glyphicon-ok cmd-checkmark cmd-queued"></span> ' +
                    data.D +
                    '</div>'
                );
            }
            else if ('D' in data) {
                // no id, so don't show status
                msgEl = $(
                    "<div class=\"out\">" +
                    data.D +
                    '</div>'
                );
            }
            if (msgEl != null)
                this.appendLog(msgEl);
            //console.groupEnd();

        },
        jsonOnWrite: function(data) {
            if (data.Id.length > 0)
                $('.com-chilipeppr-widget-spconsole-console-log #' + data.Id + " span").removeClass('cmd-queued').addClass('cmd-write');
        },
        jsonOnComplete: function(data) {
            if (data.Id.length > 0)
                $('.com-chilipeppr-widget-spconsole-console-log #' + data.Id + " span").removeClass('cmd-queued cmd-write').addClass('cmd-complete');
        },
        onRecvLine: function(data) {
            // if we are in json mode, then we don't want recvlines
            // console.log("regexp onRecvLine. data:", data);
            if (this.isInJsonMode) {
                // console.log("we are isInJsonMode so returning");
                return;
            }
            
            if (data.dataline) {
                // console.log("passing to appendLog. data.dataline:", data.dataline);
                this.appendLog(data.dataline);
            }
        },
        onEchoOfSend: function(data) {
            this.appendLogEchoCmd(data);
        },
        setupResizeable: function() {
            //$( "#com-chilipeppr-widget-gcode-body" ).resizable({
            $(".com-chilipeppr-widget-spconsole").resizable({
                //alsoResize: "#com-chilipeppr-widget-gcode-body-2col > td:first"
                alsoResize: ".com-chilipeppr-widget-spconsole-console-log",
                //ndex:1
                //handles: "s",

                //maxHeight:1000,
                resize: function(evt) {
                    console.log("resize resize", evt);
                    //$( ".com-chilipeppr-widget-spconsole" ).removeAttr("style");
                    $(".com-chilipeppr-widget-spconsole").css('height', 'initial');
                    $(".com-chilipeppr-widget-spconsole-console-log").css('width', 'initial');
                },
                start: function(evt) {
                    console.log("resize start", evt);
                },
                stop: function(evt) {
                    console.log("resize stop", evt);
                    //$( ".com-chilipeppr-widget-spconsole" ).removeAttr("style");
                    $(".com-chilipeppr-widget-spconsole").css('height', 'initial');
                    $(".com-chilipeppr-widget-spconsole-console-log").css('width', 'initial');
                }
            });
            this.resizerSetup();
        },
        subscribeSetup: function() {
            // We will subscribe to the port list.
            // If anything is open, we'll pick the first one
            // If multiple opens, we'll show a pulldown
            chilipeppr.subscribe("/com-chilipeppr-widget-serialport/list", this, this.onPortList);
            // Since we may load after the ChiliPeppr Serial Port Server object
            // we can also publish a request to resend the list
            chilipeppr.publish("/com-chilipeppr-widget-serialport/getlist", "");
            
            
        },
        onRecvSingleSelectPort: function(data) {
            // we need to override what port we're bound to here
            console.log("onRecvSingleSelectPort. data:", data);
            this.portBoundTo = data;
            this.portIsBound = true;
            var hdr = $('.com-chilipeppr-widget-spconsole .panel-heading .panel-title');
            if (this.portBoundTo)
                hdr.html("Console <span class=\"subtitle\">" + this.portBoundTo.Name + "</span>");
            else
                hdr.html("Console <span class=\"subtitle\">" + "No port" + "</span>");
            
        },
        onPortList: function(ports) {
            // This gets called when a publish occurs on
            // "/com-chilipeppr-widget-serialport/list"
            // We are sent an object of ports
            console.log("Got port list from a publish on the serial port selector widget. Going to use that to pick a port for the console. ports:", ports);
            // find if any are open
            var isAnyOpen = false;
            var that = this;
            var ctrPorts = 0;
            if (!ports) ports = "";
            $.each(ports, function(item, val) {
                console.log("item:", item, "val:", val);
                if (val.IsOpen) {
                    ctrPorts++;
                    isAnyOpen = true;
                    that.portBoundTo = val;
                    that.portIsBound = true;
                }
            });
            var hdr = $('.com-chilipeppr-widget-spconsole .panel-heading .panel-title');
            if (ctrPorts == 1) {
                // we have a single port. good. this is easy
                hdr.html("Serial Port Console <span class=\"subtitle\">" + this.portBoundTo.Name + "</span>");
            }
            else if (ctrPorts > 1) {
                hdr.html("Serial Port Console <span class=\"subtitle\">" + this.portBoundTo.Name - " Multi</span>");
            }
            else {
                hdr.html("Serial Port Console <span class=\"subtitle\">" + "No port selected</span>");
            }
        },
        resizePtr: null,
        resize: function() {
            // trigger a resize with a delay and a de-dupe procedure in case we get called multiple times
            // quickly, cuz we could get contention on resize
            if (this.resizePtr == null) {
                this.resizePtr = setTimeout(this.resizeCallback.bind(this), 500);
            } else {
                console.log("resize: got resize called, but we are already in queue. we will reset delay.");
                clearTimeout(this.resizePtr);
                this.resizePtr = setTimeout(this.resizeCallback.bind(this), 500);
            }
        },
        resizeCallback: function() {
            // add the top of the widget + height of widget
            // to get sizing. then subtract that from height of window to figure out what height to add (subtract) from log
            var wdgt = $('.com-chilipeppr-widget-spconsole');
            var wht = wdgt.offset().top + wdgt.height();
            var delta = $(window).height() - wht;
            //console.log("delta:", delta, "wht:", wht);
            var loght = $('.com-chilipeppr-widget-spconsole-console-log').height();
            var newHeight = loght + delta - 13;
            // don't let newHeight go lower than 100 cuz people think window is hidden then
            if (newHeight < 20) newHeight = 20;
            console.log("resize: serial port console newHeight:", newHeight);
            $('.com-chilipeppr-widget-spconsole-console-log').height(newHeight);
            this.resizePtr = null;
        },
        resizerSetup: function() {
            // due to the layout complexity here of being
            // nested very deep, doing absolute positioning
            // for pure CSS resize is not working, so use
            // jquery resize
            var that = this;
            $(window).resize(function() {
                //console.log("New height of window after resize: ", $( window ).height() );
                //console.log("New pos of .com-chilipeppr-widget-spconsole:", $('.com-chilipeppr-widget-spconsole').offset(), "height:",  $('.com-chilipeppr-widget-spconsole').height());
                //console.log("New height of .com-chilipeppr-widget-spconsole-console-log:", $('.com-chilipeppr-widget-spconsole-console-log').height() );
                that.resize();
            });
        },
        forkSetup: function() {
            //$('.com-chilipeppr-widget-spconsole .fork').prop('href', this.fiddleurl);
            //$('.com-chilipeppr-widget-spconsole .standalone').prop('href', this.url);
            //$('.com-chilipeppr-widget-spconsole .fork-name').html(this.id);
            $('.com-chilipeppr-widget-spconsole .panel-title').popover({
                title: this.name,
                content: this.desc,
                html: true,
                delay: 200,
                animation: true,
                trigger: 'hover',
                placement: 'auto'
            });

            // load the pubsub viewer / fork element which decorates our upper right pulldown
            // menu with the ability to see the pubsubs from this widget and the forking links
            var that = this;
            chilipeppr.load(
                "http://raw.githubusercontent.com/chilipeppr/widget-pubsubviewer/master/auto-generated-widget.html",
                // "http://fiddle.jshell.net/chilipeppr/zMbL9/show/light/", 
                function() {
                require(['inline:com-chilipeppr-elem-pubsubviewer'], function(pubsubviewer) {
                    pubsubviewer.attachTo($('.com-chilipeppr-widget-spconsole .panel-heading .dropdown-menu'), that);
                });
            });

        },
        btnBarSetup: function() {
            var that = this;
            this.forkSetup();
            $('.com-chilipeppr-widget-spconsole .btn').tooltip({
                animation: true,
                delay: 100,
                container: 'body'
            });
        },
        history: [], // store history of commands so user can iterate back
        historyLastShownIndex: null, // store last shown index so iterate from call to call
        pushOntoHistory: function(cmd) {
            this.history.push(cmd);

            // push onto dropup menu
            var el = $('<li><a href="javascript:">' + cmd + '</a></li>');
            $('#com-chilipeppr-widget-spconsole-consoleform .dropdown-menu').append(el);
            el.click(cmd, this.onHistoryMenuClick.bind(this));
        },
        onHistoryMenuClick: function(evt) {
            console.log("got onHistoryMenuClick. data:", evt.data);
            $("#com-chilipeppr-widget-spconsole-consoleform .user-txt-input").val(evt.data);
            //return true;
        },
        globalCmdCtr: 0, // keep a running ctr for getting a unique id for console serial cmds
        consoleSetup: function() {
            var that = this;

            if (!that.isSinglePortMode) {
                that.consoleSubscribeToLowLevelSerial();
            }

            $("#com-chilipeppr-widget-spconsole-consoleform").submit(function(evt) {
                //console.log("got submit on form");
                console.group("submit on form in serial port console");
                evt.preventDefault();

                var msg = $('#com-chilipeppr-widget-spconsole-consoleform .user-txt-input');
                console.log("msg:", msg.val());
                //if (!msg.val()) {
                //    return false;
                //}

                // push onto history stack
                if (msg.val().length > 0) {
                    //console.log("pushing msg to history. msg:", msg.val());
                    that.pushOntoHistory(msg.val());

                }

                var newline = "\n";

                // publish the cmd to the serial port
                if (that.isSinglePortMode) {
                    // we're in single port mode, so publish to high-level
                    // /send channel and let serial port widget figure out
                    // what port to send to

                    if (that.isInJsonMode) {
                        // send via json method now
                        var cmd = {
                            D: msg.val() + newline,
                            Id: "console" + that.globalCmdCtr++
                        }
                        chilipeppr.publish("/com-chilipeppr-widget-serialport/jsonSend", cmd);
                    }
                    else {
                        // send traditionally
                        chilipeppr.publish("/com-chilipeppr-widget-serialport/send", msg.val() + newline);
                    }

                }
                else {
                    // show this msg in the log as an echo cmd
                    that.appendLogEchoCmd(msg.val());
                    // publish to the low-level /ws/send so we can
                    // specify the port
                    //console.log("that:", that);
                    //console.log("portBoundTo:", that.portBoundTo);
                    if (that.portBoundTo && that.portBoundTo.Name) {
                        var cmd = "send " + that.portBoundTo.Name + " " + msg.val() + newline;
                        //console.log("Publishing cmd: ", cmd);
                        chilipeppr.publish("/com-chilipeppr-widget-serialport/ws/send", cmd);
                    }
                }

                // reset .user-txt-input box to empty
                msg.val("");
                // reset history on submit
                that.historyLastShownIndex = null;
                console.groupEnd();
                return false;
            });

            // show history by letting user do up/down arrows
            $("#com-chilipeppr-widget-spconsole-consoleform").keydown(function(evt) {
                //console.log("got keydown. evt.which:", evt.which, "evt:", evt);
                if (evt.which == 38) {
                    // up arrow
                    if (that.historyLastShownIndex == null)
                        that.historyLastShownIndex = that.history.length;
                    that.historyLastShownIndex--;
                    if (that.historyLastShownIndex < 0) {
                        console.log("out of history to show. up arrow.");
                        that.historyLastShownIndex = 0;
                        return;
                    }
                    var el = $("#com-chilipeppr-widget-spconsole-consoleform .user-txt-input");
                    el.val(that.history[that.historyLastShownIndex]);
                    that.jumpCursorToEnd(el);
                }
                else if (evt.which == 40) {
                    if (that.historyLastShownIndex == null)
                        return;
                    //that.historyLastShownIndex = -1;
                    that.historyLastShownIndex++;
                    if (that.historyLastShownIndex >= that.history.length) {
                        console.log("out of history to show. down arrow.");
                        that.historyLastShownIndex = that.history.length;
                        $("#com-chilipeppr-widget-spconsole-consoleform .user-txt-input").val("");
                        return;
                    }
                    var el = $("#com-chilipeppr-widget-spconsole-consoleform .user-txt-input");
                    el.val(that.history[that.historyLastShownIndex]);
                    that.jumpCursorToEnd(el);
                }
            });

        },
        jumpCursorToEnd: function(myelem) {
        	var elem = myelem;
          setTimeout(function(){
            elem = $(elem).get(0);
            console.log("jumptoend. elem:", elem);
            var elemLen = elem.value.length;
            // For IE Only
            if (document.selection) {
              // Set focus
              elem.focus();
              // Use IE Ranges
              var oSel = document.selection.createRange();
              // Reset position to 0 & then set at end
              oSel.moveStart('character', -elemLen);
              oSel.moveStart('character', elemLen);
              oSel.moveEnd('character', 0);
              oSel.select();
            }
            else if (elem.selectionStart || elem.selectionStart == '0') {
              // Firefox/Chrome
              elem.selectionStart = elemLen;
              elem.selectionEnd = elemLen;
              elem.focus();
              console.log("using chrome approach", elem.selectionStart, elem.selectionEnd, elemLen, elem);
            } // if
          }, 5);
        },
        isAlreadySubscribedToWsRecv: false,
        dataBuffer: "",
        consoleSubscribeToLowLevelSerial: function() {
            // subscribe to websocket events
            if (this.isAlreadySubscribedToWsRecv) {
                console.warn("already subscribed to /ws/recv in console, so not subscribing again");
            } else {
                this.isAlreadySubscribedToWsRecv = true;
                chilipeppr.subscribe("/com-chilipeppr-widget-serialport/ws/recv", this, function(msg) {
            
                    // make sure the data is for the port we're bound to
                    if (msg.match(/^\{/)) {
                        // it's json
                        //console.log("it is json");
                        var data = $.parseJSON(msg);
                        if (this.portBoundTo && this.portBoundTo.Name && data.P && data.P == this.portBoundTo.Name) {
                            // this is our serial port data
                            var d = data.D;
                            // convert newlines
                            // console.log("data before replace:", d);
                            // console.log("this.dataBuffer:", this.dataBuffer);
                            
                            
                            // what we're doing here is buffering the incoming data to then
                            // split on newlines and then passing to appendLog
                            
                            if (d == undefined) {
                                // console.log("data was undefined so not appending");
                            } else {
                                this.dataBuffer += d;
                            }
                            
                            // see if we got newline
                            while (this.dataBuffer.match(/\n/)) {
                                //console.log("we have a newline.");
                                var tokens = this.dataBuffer.split(/\r{0,1}\n/);
                                // console.log("tokens:", tokens, "joined:", tokens.join(" : "));
                                var line = tokens.shift() + "\n";
                                // this.dataBuffer = tokens.filter(function (val) {return val;}).join("\n");
                                this.dataBuffer = tokens.join("\n");
                                // console.log("publishing line:", line);
                                // console.log("new buffer:", this.dataBuffer, "len:", this.dataBuffer.length);
                                
                                this.appendLog(line);
                            }
                            
                            //d.replace(/\r\n|\r|\n/gm, "<br/>");
                            //var spd = $("<div/>").text(data.D);
                            //console.log("data after replace:", d);
                            
                            // this.appendLog(d);
                        }
                    }
                });
            }
        },
        appendLogEchoCmd: function(msg) {
            //console.log("appendLogEchoCmd. msg:", msg);
            var msg2 = $("<div class=\"out\"/>").text("" + msg);
            //console.log(msg2);
            this.appendLog(msg2);
        },
        logSetup: function() {
            if (this.logEls.log == null) {
                console.log("lazy loading logEls. logEls:", this.logEls);
                this.logEls.log = $('.com-chilipeppr-widget-spconsole-console-log pre');
                this.logEls.logOuter = $('.com-chilipeppr-widget-spconsole-console-log');
            }
        },
        logEls: {
            log: null,
            logOuter: null,
        },
        appendLog: function(msg) {
            // console.warn("regexp appendLog. msg:", msg);

            // if msg null then just return
            if (typeof msg == 'undefined' || msg == null) {
                return;
            }

            // if there is a regular expression set, we will enter the analysis here
            // remember, we get text and jquery HTML element payloads
            if (this.isFilterActive) {
                
                console.log("filter is active. regexp:", this.filterRegExp);
                
                // see if log matches filter and ignore
                if (!(msg.appendTo) && msg.match(this.filterRegExp)) {
                    // this means it's a text object and it matched the regexp
                    console.log("regexp filter active and we matched so not printing. would have printed:", msg);
                    return;
                } else if (msg.appendTo) {
                    // this means it's a jquery object, we have to probe deeper on the text to filter
                    var msgText = msg.text();
                    msgText = msgText.trim();
                    if (msgText.match(this.filterRegExp)) {
                        console.log("found HTML element log and the HTML text matched the regexp, so not printing. would have printed:", msgText);
                        return;
                    } else {
                        console.log("found HTML element, but it did not match regexp so still printing. msgText:", msgText);
                    }
                
                } else {
                    console.log("regexp msg did not match. msg:", msg);
                }
            }


            //console.log("logEls:", this.logEls);
            //console.log(this.logEls.logOuter);
            var d = this.logEls.logOuter[0];
            var doScroll = d.scrollTop == d.scrollHeight - d.clientHeight;
            var log = this.logEls.log;
            if (log.html().length > 50000) {
                // truncating log
                console.log("Truncating log.");
                /*
                var logHtml = log.html().split(/\n/);
                var sliceStart = logHtml.length - 200;
                if (sliceStart < 0) sliceStart = 0;
                log.html(logHtml.slice(sliceStart).join("\n"));
                */
                var loghtml = log.html();
                log.html("--truncated--" + loghtml.substring(loghtml.length - 2500));
            }
            if (msg && msg.appendTo) {
                // msg is html element
                msg.appendTo(log);
            } else {
                // msg is raw text
                // swap < and > for &lt; and &gt;
                msg = msg.replace("<", "&lt;").replace(">", "&gt;");
                log.html(log.html() + msg);
            }
            
            //if (doScroll) {
            d.scrollTop = d.scrollHeight - d.clientHeight;
            //}
        },
        serialConsoleSaveCookie: function(portname) {
            var settings = JSON.stringify({
                name: portname
            });

            // store our port/baud settings in cookie for convenience
            $.cookie('com-chilipeppr-spconsole-port', settings, {
                expires: 365,
                path: '/'
            });

        },
        serialConsoleGetCookie: function(portname) {
            // get cookies that may have been stored for the previous settings
            // of the baud, rts, dtr settings
            // make sure we loaded jquery.cookie plugin
            var settings = $.cookie('com-chilipeppr-spconsole-port');
            //console.log("getCookie:", settings);
            if (settings) {
                settings = $.parseJSON(settings);
                //console.log("just evaled settings: ", settings);
            }
            return settings;
        },
    }
});