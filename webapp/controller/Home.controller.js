sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/m/MessageToast",
    "sap/ui/model/FilterOperator",
    "sap/m/Dialog",
    "sap/m/library",
    "sap/m/Button",
    "sap/m/Text"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Fragment, Filter, MessageToast, FilterOperator, Dialog, mobileLibrary, Button, Text) {
        "use strict";
        var that;
        return Controller.extend("vcpapp.vcplocproduniqid.controller.Home", {
            onInit: function () {
                that = this;
                that.oGModel = this.getOwnerComponent().getModel("oGModel");
                that.oTabtModel = new JSONModel();
                this.locModel = new JSONModel();
                this.locModel.setSizeLimit(5000);
                this.prodModel = new JSONModel();
                this.prodModel.setSizeLimit(5000);
                this.oCharModel = new JSONModel();
                this.oCharModel.setSizeLimit(5000);
            },
            onAfterRendering: function () {
                sap.ui.core.BusyIndicator.show();
                // that.oLoc = this.byId("PDFlocInput");
                that.oProd = this.byId("PDFprodInput");
                // Declaring fragments
                this._oCore = sap.ui.getCore();
                if (!this._valueHelpDialogLoc) {
                    this._valueHelpDialogLoc = sap.ui.xmlfragment(
                        "vcpapp.vcplocproduniqid.view.LocDialog",
                        this
                    );
                    this.getView().addDependent(this._valueHelpDialogLoc);
                }
                if (!this._valueHelpDialogProd) {
                    this._valueHelpDialogProd = sap.ui.xmlfragment(
                        "vcpapp.vcplocproduniqid.view.ProdDialog",
                        this
                    );
                    this.getView().addDependent(this._valueHelpDialogProd);
                }
                if (!this._valueHelpDialogChar) {
                    this._valueHelpDialogChar = sap.ui.xmlfragment(
                        "vcpapp.vcplocproduniqid.view.Characteristics",
                        this
                    );
                    this.getView().addDependent(this._valueHelpDialogChar);
                }
                this.oProductList = this._oCore.byId(
                    this._valueHelpDialogProd.getId() + "-list"
                );
                this.oLocList = this._oCore.byId(
                    this._valueHelpDialogLoc.getId() + "-list"
                );
                // this.getOwnerComponent().getModel("BModel").read("/genPartialProd", {
                //     success: function (oData) {
                //         that.totalData = oData.results;
                //         // that.LocData = that.removeDuplicate(oData.results,"LOCATION_ID");
                //         // that.locModel.setData({
                //         //     Locitems: that.LocData
                //         // });
                //         // that.oLocList.setModel(that.locModel);
                //         sap.ui.core.BusyIndicator.hide();
                //     },
                //     error: function (oData, error) {
                //         sap.ui.core.BusyIndicator.hide();
                //         MessageToast.show("error");
                //     },
                // });
                that.skip = 0;
                that.oGModel = that.getOwnerComponent().getModel("oGModel")
                sap.ui.core.BusyIndicator.show();
                that.getOwnerComponent().getModel("PCModel").read("/getUserPreferences", {
                    filters: [
                        new sap.ui.model.Filter("PARAMETER", sap.ui.model.FilterOperator.EQ, "MAX_RECORDS")
                    ],
                    success: function (oData) {
                        sap.ui.core.BusyIndicator.hide();
                        that.oGModel.setProperty("/MaxCount", oData.results[0].PARAMETER_VALUE);
                        //     that.onGetData();

                    },
                    error: function (oData, error) {
                        sap.ui.core.BusyIndicator.hide();
                        console.log(error)
                    },
                });
            },
            removeDuplicate(array, key) {
                var check = new Set();
                return array.filter(obj => !check.has(obj[key]) && check.add(obj[key]));
            },
            handleValueHelp: function (oEvent) {
                that.oPrd = []
                var sId = oEvent.getSource().getId();
                if (sId.includes("PDFlocInput")) {
                    that._valueHelpDialogLoc.open();
                }
                else if (sId.includes("PDFprodInput")) {
                    sap.ui.core.BusyIndicator.show();
                    that.onProductSelect();
                    //  let aData = that.totalData;
                    // that.prodData = that.removeDuplicate(aData, "PRODUCT_ID");
                    // that.prodModel.setData({ prodDetails: that.prodData });
                    // that.oProductList.setModel(that.prodModel);
                    // that.oTabtModel.setData({ setChars: [] });
                    // that.byId("idChars").setModel(that.oTabtModel);
                    // sap.ui.core.BusyIndicator.hide();
                    // if (this.byId("PDFlocInput").getValue()) {
                    //     that._valueHelpDialogProd.open();
                    // }
                    // else {
                    //     MessageToast.show("Select Location");
                    // }
                    //    that._valueHelpDialogProd.open();
                }

            },
            onProductSelect: function () {
                var topCount = that.oGModel.getProperty("/MaxCount");
                
                this.getOwnerComponent().getModel("BModel").read("/genPartialProd", {
                    urlParameters: {
                        "$skip": that.skip,
                        "$top": topCount
                    },
                    success: function (oData) {
                        // that.totalData = oData.results;
                        if (topCount == oData.results.length) {
                            that.skip += parseInt(topCount);
                            that.oPrd = that.oPrd.concat(oData.results);
                            that.onProductSelect();
                        } else {
                            that.skip = 0;
                            that.oPrd = that.oPrd.concat(oData.results);
                            that.prodData = that.removeDuplicate(that.oPrd, "PRODUCT_ID");
                            that.prodModel.setData({ prodDetails: that.prodData });
                            that.oProductList.setModel(that.prodModel);
                            that.oTabtModel.setData({ setChars: [] });
                            that.byId("idChars").setModel(that.oTabtModel);
                            sap.ui.core.BusyIndicator.hide();
                            that._valueHelpDialogProd.open();
                        }

                    },
                    error: function (oData, error) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("error");
                    },
                });
            },

            handleSearch: function (oEvent) {
                var sQuery =
                    oEvent.getParameter("value") || oEvent.getParameter("newValue"),
                    sId = oEvent.getParameter("id"),
                    oFilters = [];
                // Check if search filter is to be applied
                sQuery = sQuery ? sQuery.trim() : "";
                if (sId.includes("application")) {
                    if (sQuery !== "") {
                        oFilters.push(
                            new Filter({
                                filters: [
                                    new Filter("UNIQUE_ID", FilterOperator.Contains, sQuery),
                                    new Filter("PRIMARY_ID", FilterOperator.Contains, sQuery),
                                ],
                                and: false,
                            })
                        );
                    }
                    that.byId("idChars").getBinding("items").filter(oFilters);
                }
                // Location
                else if (sId.includes("Loc")) {
                    if (sQuery !== "") {
                        oFilters.push(
                            new Filter({
                                filters: [
                                    new Filter("LOCATION_ID", FilterOperator.Contains, sQuery),
                                    new Filter("LOCATION_DESC", FilterOperator.Contains, sQuery)
                                ],
                                and: false,
                            })
                        );
                    }
                    that.oLocList.getBinding("items").filter(oFilters);
                }
                else if (sId.includes("headtab")) {
                    if (sQuery !== "") {
                        oFilters.push(
                            new Filter({
                                filters: [
                                    new Filter("PRIMARY_ID", FilterOperator.Contains, sQuery),
                                    new Filter("UNIQUE_ID", FilterOperator.Contains, sQuery),
                                    new Filter("UNIQUE_DESC", FilterOperator.Contains, sQuery)
                                ],
                                and: false,
                            })
                        );
                    }
                    that.byId("idChars").getBinding("items").filter(oFilters);
                }
                // Product
                else if (sId.includes("prod")) {
                    if (sQuery !== "") {
                        oFilters.push(
                            new Filter({
                                filters: [
                                    new Filter("PRODUCT_ID", FilterOperator.Contains, sQuery),
                                    new Filter("PROD_DESC", FilterOperator.Contains, sQuery),
                                ],
                                and: false,
                            })
                        );
                    }
                    that.oProductList.getBinding("items").filter(oFilters);
                }
                else if (sId.includes("idCharSearch")) {
                    if (sQuery !== "") {
                        oFilters.push(
                            new Filter({
                                filters: [
                                    new Filter("CHAR_NAME", FilterOperator.Contains, sQuery),
                                    new Filter("CHAR_DESC", FilterOperator.Contains, sQuery),
                                    new Filter("CHAR_VALUE", FilterOperator.Contains, sQuery),
                                    new Filter("CHARVAL_DESC", FilterOperator.Contains, sQuery),
                                ],
                                and: false,
                            })
                        );
                    }
                    sap.ui.getCore().byId("idMatvarItem").getBinding("items").filter(oFilters);
                }
            },
            handleSelection: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                var SID = oEvent.getSource().getId();
                // if (SID.includes("LocSlctListJS")) {
                //     that.oProd.removeAllTokens();
                //     var aSelectedLoc = oEvent.getParameter("selectedItems");
                //     that.oLoc.setValue(aSelectedLoc[0].getTitle());
                //     let aData = that.totalData.filter(f => f.LOCATION_ID == aSelectedLoc[0].getTitle() );
                //             that.prodData = that.removeDuplicate(aData,"PRODUCT_ID");
                //             that.prodModel.setData({ prodDetails: that.prodData });
                //             that.oProductList.setModel(that.prodModel);
                //             that.oTabtModel.setData({setChars:[]});
                //             that.byId("idChars").setModel(that.oTabtModel); 
                //             sap.ui.core.BusyIndicator.hide();
                // }
                // else
                if (SID.includes("prodSlctListJS")) {
                    var aSelectedProd;
                    aSelectedProd = oEvent.getParameter("selectedItems");
                    that.oProd.removeAllTokens();
                    aSelectedProd.forEach(function (oItem) {
                        that.oProd.addToken(
                            new sap.m.Token({
                                key: oItem.getTitle(),
                                text: oItem.getTitle(),
                                editable: false,

                            })
                        );
                    });
                    that.oTabtModel.setData({ setChars: [] });
                    that.byId("idChars").setModel(that.oTabtModel);
                    that.selectedRefProd = oEvent.getParameters().selectedItems[0].getInfo();
                    sap.ui.core.BusyIndicator.hide();
                    sap.ui.getCore().byId("prodSlctListJS").getBinding("items").filter([]);
                }
            },
            onCancelPress: function () {
                // that.oLoc.setValue();
                that.oProd.removeAllTokens();
                that.oTabtModel.setData({ setChars: [] });
                that.byId("idChars").setModel(that.oTabtModel);
                that.byId("headtabSearch").setValue();
            },
            //on press of submit
            onSubmitPress: function () {
                that.Uids = []
                sap.ui.core.BusyIndicator.show();
                that.onGo();
            },

            onGo: function () {
                var table = that.byId("idChars");
                // var selectedLoc = that.byId("PDFlocInput").getValue();
                var selectedProd1 = that.byId("PDFprodInput").getTokens()[0];
                var topCount = that.oGModel.getProperty("/MaxCount");
                if (
                    // selectedLoc !== undefined &&
                    // selectedLoc !== "" &&
                    selectedProd1 !== undefined &&
                    selectedProd1 !== "") {
                    var selectedProd = that.byId("PDFprodInput").getTokens()[0].getText();
                    var refProd = that.selectedRefProd;
                    if (selectedProd === refProd) {
                        var FLAG = "Z";
                    }
                    else {
                        var FLAG = "Y";
                    }
                    // var selectedLoc = that.byId("PDFlocInput").getValue();
                    that.getOwnerComponent().getModel("BModel").read("/getLocProdSalesH", {
                        method: "GET",
                        // filters: [new Filter("PRODUCT_ID", FilterOperator.EQ, selectedProd)],
                        urlParameters: {
                            Flag: FLAG,
                            PRODUCT_ID: selectedProd,
                            "$skip": that.skip,
                            "$top": topCount
                        },
                        success: function (oData) {
                            that.selectedChars = [];
                            if (topCount == oData.results.length) {
                                that.skip += parseInt(topCount);
                                that.Uids = that.Uids.concat(oData.results);
                                that.onGo();
                            }
                            else {
                                if (oData.results.length > 0) {
                                    that.skip = 0;
                                    that.Uids = that.Uids.concat(oData.results);
                                    that.uniqId = that.removeDuplicate(oData.results, 'UNIQUE_ID');
                                    // that.uniqId=oData.results;
                                    that.uniqId.forEach(function (obj) {
                                        obj.UNIQUE_ID = obj.UNIQUE_ID.toString();
                                        obj.PRIMARY_ID = obj.PRIMARY_ID.toString();
                                    });
                                    that.oTabtModel.setData({ setChars: that.uniqId });
                                    table.setModel(that.oTabtModel);
                                }
                                else {
                                    sap.m.MessageToast.show("No ID's for selected Product");
                                    that.oTabtModel.setData({ setChars: [] });
                                    table.setModel(that.oTabtModel);
                                }
                                sap.ui.core.BusyIndicator.hide();
                            }
                        },
                        error: function (oData, error) {
                            sap.ui.core.BusyIndicator.hide();
                            MessageToast.show("error");
                        },
                    });

                }
                else {
                    sap.ui.core.BusyIndicator.hide();
                    MessageToast.show("Please Select Product");
                }
            },
            onNavPress: function () {
                if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
                    jQuery.sap.storage(jQuery.sap.storage.Type.local).put("data", 0);
                    var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
                    // generate the Hash to display
                    var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                        target: {
                            semanticObject: "VCPDocument",
                            action: "Display"
                        }
                    })) || "";
                    //Generate a  URL for the second application
                    var url = window.location.href.split('#')[0] + hash;
                    // //Navigate to second app
                    sap.m.URLHelper.redirect(url, true);
                }
            },
            onUniqueIdPress: function (oEvent) {
                sap.ui.core.BusyIndicator.show();
                // var selectedItem = oEvent.getParameters().listItems[0].getCells()[1].getTitle();
                var selectedItem = oEvent.getSource().getText();
                var selectedProduct = that.byId("PDFprodInput").getTokens()[0].getText();
                that.getOwnerComponent().getModel("BModel").read("/getUniqueItem", {
                    filters: [
                        // new Filter("LOCATION_ID", FilterOperator.EQ, sLocId),
                        // new Filter("PRODUCT_ID", FilterOperator.EQ, selectedProduct),
                        new Filter("UNIQUE_ID", FilterOperator.EQ, selectedItem),
                    ],
                    success: function (oData) {
                        // oGModel.setProperty("/CharData", oData.results);
                        that.oCharModel.setData({
                            resultsChar: oData.results,
                        });
                        if (!that._valueHelpDialogChar) {
                            that._valueHelpDialogChar = sap.ui.xmlfragment(
                                "vcpapp.vcplocproduniqid.view.Characteristics",
                                that
                            );
                            that.getView().addDependent(that._valueHelpDialogChar);
                        }
                        sap.ui.getCore().byId("idMatvarItem").setModel(that.oCharModel);
                        that._valueHelpDialogChar.open();
                        sap.ui.core.BusyIndicator.hide();
                    },
                    error: function () {
                        sap.ui.core.BusyIndicator.hide();
                        MessageToast.show("No data");
                    },
                });
            },
            onCloseDesc: function () {
                sap.ui.getCore().byId("idCharSearch").setValue("");
                that._valueHelpDialogChar.destroy();
                that._valueHelpDialogChar = "";
                that.byId("idChars").removeSelections();
            }
        });
    });

