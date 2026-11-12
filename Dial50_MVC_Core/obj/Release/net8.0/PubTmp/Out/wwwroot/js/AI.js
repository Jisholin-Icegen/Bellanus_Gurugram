function InitConversationStatus(ConvID) {

    return $.ajax({
        url: '/AI/ConversationStatus',
        type: 'POST',
        data: { ConvID: ConvID },
        dataType: 'json'
    });

}