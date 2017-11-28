function openChat(){
    var frame = document.getElementById("chatFrame");
    //var page = document.getElementById("blurABLE");
    frame.className = "";
    //page.className = "blurIT";
}

function closeWindow(){
    var frame = document.getElementById("chatFrame");
    //var page = document.getElementsByClassName("blurABLE");
    frame.className = "hidden";
    //page.className = "unBlur";
}

function increaseFontSize(){
    if(document.getElementById("resize").style.fontSize == "x-large"){
        document.getElementById("resize").style.fontSize = "medium";
        document.getElementById("subheading").style.fontSize = "medium";
    }
    else{
        document.getElementById("resize").style.fontSize = "x-large";
        document.getElementById("subheading").style.fontSize = "x-large";
    }
}

