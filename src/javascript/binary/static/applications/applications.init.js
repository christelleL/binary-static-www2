var Applications = (function(){
    "use strict";
    
    var tableExist = function(){
        return document.getElementById("applications-table");
    };
    
    function responseHandler(response){
        if (response.hasOwnProperty('error') && response.error.message) {
          $("#applications-ws-container .error-msg").text(response.error.message);
          return;
        } else {

            var applications = response.oauth_apps;
            
            if (!tableExist()) {
                $("#loading").remove();
                ApplicationsUI.createEmptyTable().appendTo("#applications-ws-container");
                var titleElement = document.getElementById("applications-title").firstElementChild;
                titleElement.textContent = text.localize(titleElement.textContent);
            }
            
            // Show a message when the table is empty
            if (applications.length === 0) {
                console.log("Zero");
                $('#applications-table tbody')
                    .append($('<tr/>', {class: "flex-tr"})
                        .append($('<td/>', {colspan: 7})
                            .append($('<p/>', {class: "notice-msg center", text: text.localize("You have not granted access to any applications.")})
                            )
                        )
                    );
            }
            else{
                ApplicationsUI.createTable(applications);
            }
        }
    }
    
    function initPage(){
        showLoadingImage($('<div/>', {id: 'loading'}).insertAfter('#applications-title'));
        ApplicationsData.getApplications();
    }
    
    function initTable(){
        $("#applications-ws-container .error-msg").text("");
        ApplicationsUI.clearTableContent();
    }

    return {
        init: initPage,
        responseHandler: responseHandler,
        clean: initTable
    };
}());
