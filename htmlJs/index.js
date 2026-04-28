function init() {

    document.title = "Hello Napier Example"

 

    var button = document.createElement("button");

    button.innerHTML = "Hello";

    button.id = "hello_btn";

    var body = document.getElementsByTagName("body")[0];

    body.appendChild(button);

 

    document.getElementById('hello_btn').onclick = function() {

        var text_node = document.createTextNode('Napier!');

            document.body.appendChild(text_node);  

    };

};
window.onload=init;