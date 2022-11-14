sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Filter, FilterOperator, MessageBox) {
        "use strict";

        return Controller.extend("SYNC.zdcmmui5gisg.controller.Main", {
            onInit: function () {
                let oViewModel,
                    iOriginalBusyDelay,
                    SflagValue,
                    oHeaderTable = this.byId("likpTable"),
                    oItemTable = this.byId("lipsTable"),
                    dynamicPage = this.byId("dynamicPageId");
                dynamicPage.setShowFooter(true);

                iOriginalBusyDelay = oHeaderTable.getBusyIndicatorDelay();
                SflagValue = '1'; //"Sflag"
                this._startFlag = false;
                this._oHeaderTable = oHeaderTable;
                this._oItemTable = oItemTable;
                this._dynamicPage = dynamicPage;
                this._SflagValue = SflagValue;

                // keeps the search state
                this._aTableSearchState = [];

                oViewModel = new JSONModel({
                    tableBusyDelay: 0,
                    approve: 0,
                    getApproval: 0,
                    companion: 0,
                    countAll: 0
                });
                this.getView().setModel(oViewModel, "worklistView");

                // Approve=승인
                // getApproval=상신
                // Companion=반려
                // Create an object of filters
                this._mFilters = {
                    "approve": [new Filter("Sflag", sap.ui.model.FilterOperator.EQ, '2')],
                    "getApproval": [new Filter("Sflag", sap.ui.model.FilterOperator.EQ, '1')],
                    "companion": [new Filter("Sflag", sap.ui.model.FilterOperator.EQ, '3')],
                    "all": []
                };

                oHeaderTable.attachEventOnce("updateFinished", function () {
                    // Restore original busy indicator delay for worklist's table
                    oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
                });
            },
            onPress: function (oEvent) {
                // add filter for search
                let SflagValue = this._SflagValue,
                    startDateEvent = this.byId('startDateEvent'),
                    endDateEvent = this.byId('endDateEvent'),
                    startDateValue,
                    endDateValue;
                var aFilters = [];

                const oHeaderTable = this._oHeaderTable,
                      oItemTable = this._oItemTable;
                startDateValue = startDateEvent.getValue();
                endDateValue = endDateEvent.getValue();
                // let sQuery = oEvent.getSource().getValue();

                let oBinding = oHeaderTable.getBinding("items");

                if (startDateValue && endDateValue) {
                    if (SflagValue) {
                        aFilters.push(new Filter("Sflag", "EQ", SflagValue));
                        aFilters.push(new Filter("Vdatu", "BT", startDateValue, endDateValue));
                    }
                    else aFilters.push(new Filter("Vdatu", "BT", startDateValue, endDateValue));
                    
                } else if (startDateValue) {
                    if (SflagValue) {
                        aFilters.push(new Filter("Sflag", "EQ", SflagValue));
                        aFilters.push(new Filter("Vdatu", "BT", startDateValue, endDateValue));
                    }
                    else aFilters.push(new Filter("Vdatu", "BT", startDateValue, endDateValue));
                    
                } else if (endDateValue) {
                    if (SflagValue) {
                        aFilters.push(new Filter("Sflag", "EQ", SflagValue));
                        aFilters.push(new Filter("Vdatu", "BT", startDateValue, endDateValue));
                    }
                    else aFilters.push(new Filter("Vdatu", "BT", startDateValue, endDateValue));
                    
                } else {
                    if (SflagValue) aFilters.push(new Filter("Sflag", "EQ", SflagValue));
                }
                    
                oBinding.filter(new Filter({ filters: aFilters, and: true }));
                oItemTable.setModel(new JSONModel({}), 'LipsA');
            },
            onUpdateFinished: function (oEvent) {
                // update the worklist's object counter after the table update
                let oHeaderTable = oEvent.getSource(),
                    oViewModel = this.getView().getModel("worklistView");
                let oView = this.getView(),   //화면정보 객체 가져오기
                    oModel = oView.getModel('odataModel'); //(default)모델 정보 가져오기

                let iTotalItems = oEvent.getParameter("total");

                if (iTotalItems && oHeaderTable.getBinding("items").isLengthFinal()) {

                    oModel.read("/LikpSet/$count", {
                        success: function (oData) {
                            oViewModel.setProperty("/countAll", oData);
                        }
                    });

                    oModel.read("/LikpSet/$count", {
                        success: function (oData) {
                            oViewModel.setProperty("/approve", oData);
                        },
                        filters: this._mFilters.approve
                    });

                    oModel.read("/LikpSet/$count", {
                        success: function (oData) {
                            oViewModel.setProperty("/getApproval", oData);
                        },
                        filters: this._mFilters.getApproval
                    });

                    oModel.read("/LikpSet/$count", {
                        success: function (oData) {
                            oViewModel.setProperty("/companion", oData);
                        },
                        filters: this._mFilters.companion
                    });
                    if (this._startFlag == false) {
                        let oTBinding = oHeaderTable.getBinding("items");
                        oTBinding.filter(this._mFilters["getApproval"]);
                        this._startFlag = true;
                    }
                } else {

                }

            },

            onQuickFilter: function (oEvent) {
                let oBinding = this._oHeaderTable.getBinding("items"),
                    sKey = oEvent.getParameter("selectedKey"),
                    dynamicPage = this._dynamicPage,
                    SflagValue = this._SflagValue;
                const oItemTable = this._oItemTable,
                    oHeaderTable = this._oHeaderTable;
                oBinding.filter(this._mFilters[sKey]);
                if (sKey == "all") {
                    SflagValue = '';
                }
                else {
                    SflagValue = oBinding.getFilterInfo().right.value;
                }
                this._SflagValue = SflagValue;
                if (sKey == "getApproval") {
                    dynamicPage.setShowFooter(true);
                }
                else {
                    dynamicPage.setShowFooter(false);
                }

                oItemTable.setModel(new JSONModel({}), 'LipsA');
                oHeaderTable.removeSelections(true);
            },
            onSelectionChange: function (oEvent) {
                let sPath;
                sPath = oEvent.getParameter('listItem').getBindingContextPath();
                this._sPath = sPath;
                const oHeaderTable = this._oHeaderTable,
                    oItemTable = this._oItemTable;
                let oModel = this.getView().getModel('odataModel');

                // 비동기 처리 설정 ( 사용자가 응답을 받을 때 까지 테이블 Action 못하도록 )
                oHeaderTable.setBusy(true);
                oItemTable.setBusy(true);

                oModel.read(sPath, {
                    urlParameters: {
                        $expand: "LipsA"
                    },
                    success: function (data) {
                        var aLipsA = data.LipsA.results;

                        oItemTable.setModel(new JSONModel(aLipsA), 'LipsA');
                        // 비동기 해제
                        oHeaderTable.setBusy(false);
                        oItemTable.setBusy(false);
                    },
                    error: function () {
                        // 비동기 해제 
                        oHeaderTable.setBusy(false);
                        oItemTable.setBusy(false);
                    }
                })
            },
            onPressAccet: function (oEvent) {
                let oView = this.getView(),   //화면정보 객체 가져오기
                    oModel = oView.getModel('odataModel'), //(default)모델 정보 가져오기
                    sPath;
                sPath = this._sPath;
                const oLikpBodyData = {
                    "Sflag": "2"
                };

                oModel.update(sPath, oLikpBodyData, {
                    success: function (oData) {

                        MessageBox.success("성공적으로 결재가 승인 되었습니다.");
                    },
                    error: function (oError) {
                        const oMsg = JSON.parse(oError.responseText);
                        MessageBox.error(oMsg.error.innererror.errordetails[0].message, {
                            details: oMsg
                        });
                    }

                });

            },
            onPressReject: function (oEvent) {
                let oView = this.getView(),   //화면정보 객체 가져오기
                    oModel = oView.getModel('odataModel'), //(default)모델 정보 가져오기
                    sPath;
                sPath = this._sPath;
                const oLikpBodyData = {
                    "Sflag": "3"
                };

                oModel.update(sPath, oLikpBodyData, {
                    success: function (oData) {

                        MessageBox.success("성공적으로 결재가 반려 되었습니다.");
                    },
                    error: function (oError) {
                        const oMsg = JSON.parse(oError.responseText);
                        MessageBox.error(oMsg.error.innererror.errordetails[0].message, {
                            details: oMsg
                        });
                    }

                });

            }
        });
    });
