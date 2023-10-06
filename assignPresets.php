<!DOCTYPE html>
<html lang="eu" data-theme="light">

<head>
    <link rel="stylesheet" type="text/css" href="resources/css/style.css">
    <link rel="stylesheet" type="text/css" href="resources/css/mediaqueries.css">
    
    <script src="https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/mousetrap@1.6.5/mousetrap.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/js-cookie@3.0.5/dist/js.cookie.min.js"></script>
    <script src="https://kit.fontawesome.com/cc9f7fa694.js" crossorigin="anonymous"></script>
    <script src="./resources/js/index.js"></script>
    
    <title>PTZ-Optics - Presets</title>
</head>

<body>
    <section id='header'>
        <div class='linkContainer'>
        </div>
        <div id='logoBox'>
            <img src='./resources/images/PTZ-Logo.svg' id='logo'>
            <h1 id='title'>PTZ-OPTICS</h1>
        </div>
        <div class='linkContainer'>
            <a href='javascript:transition("none","./preferenceMenu.html")' class='navLink'>Preferences</a>
        </div>

    </section>

    <a href="#" class="transitionLink" id="rightTransitionLink" onClick="javascript:transition('right','./index.html')"><i class="fa-solid fa-circle-chevron-right fa-lg"></i></a>
    <section id='wrapper'>
        <section id='assignPresets'>
            <div id='assignPresetsBox'>
                <div id='titleDiv'>
                    <div id='div1'></div>
                    <div id='div2'>
                        <h1 id='assignTitle'>Assign Presets</h1>
                    </div>
                    <div id='div3'><a href='javascript:transition("none","./index.html")' id='closeLink'><i class="fa-solid fa-xmark fa-xl"></i></a></div>
                </div>
                <div id='contentDiv'>
                    <p id='one'>To assign a preset:</p>
                    <p>1. Move the camera to the position you want to set as a preset</p>
                    <p>2. Click the number that corresponds to the desired preset</p>
                    <p>3. Enter a name for the preset in the alert box</p>
                </div>
                <form method="post">
                    <div class="grid-container">
                        <div class='asgnCol'>
                            <input type="submit" value="1" name="button1" class="asgnBtn" id='assgn1'>
                        </div>
                        <div class='asgnCol'>
                            <input type="submit" value="2" name="button2" class="asgnBtn" id='assgn2'>
                        </div>
                        <div class='asgnCol'>
                            <input type="submit" value="3" name="button3" class="asgnBtn" id='assgn3'>
                        </div>
                        <div class='asgnCol'>
                            <input type="submit" value="4" name="button4" class="asgnBtn" id='assgn4'>
                        </div>
                        <div class='asgnCol'>
                            <input type="submit" value="5" name="button5" class="asgnBtn" id='assgn5'>
                        </div>
                        <div class='asgnCol'>
                            <input type="submit" value="6" name="button6" class="asgnBtn" id='assgn6'>
                        </div>
                        <div class='asgnCol'>
                            <input type="submit" value="7" name="button7" class="asgnBtn" id='assgn7'>
                        </div>
                        <div class='asgnCol'>
                            <input type="submit" value="8" name="button8" class="asgnBtn" id='assgn8'>
                        </div>
                        <div class='asgnCol'>
                            <input type="submit" value="9" name="button9" class="asgnBtn" id='assgn9'>
                        </div>
                    </div>
                </form>
            </div>
        </section>
    </section>

    <?php
    if (array_key_exists('button1', $_POST)) {
        file_put_contents("1.jpg", fopen("http://192.168.0.190/snapshot.jpg", "r"));
    } else if (array_key_exists('button2', $_POST)) {
        file_put_contents("2.jpg", fopen("http://192.168.0.190/snapshot.jpg", "r"));
    } else if (array_key_exists('button3', $_POST)) {
        file_put_contents("3.jpg", fopen("http://192.168.0.190/snapshot.jpg", "r"));
    } else if (array_key_exists('button4', $_POST)) {
        file_put_contents("4.jpg", fopen("http://192.168.0.190/snapshot.jpg", "r"));
    } else if (array_key_exists('button5', $_POST)) {
        file_put_contents("5.jpg", fopen("http://192.168.0.190/snapshot.jpg", "r"));
    } else if (array_key_exists('button6', $_POST)) {
        file_put_contents("6.jpg", fopen("http://192.168.0.190/snapshot.jpg", "r"));
    } else if (array_key_exists('button7', $_POST)) {
        file_put_contents("7.jpg", fopen("http://192.168.0.190/snapshot.jpg", "r"));
    } else if (array_key_exists('button8', $_POST)) {
        file_put_contents("8.jpg", fopen("http://192.168.0.190/snapshot.jpg", "r"));
    } else if (array_key_exists('button9', $_POST)) {
        file_put_contents("9.jpg", fopen("http://192.168.0.190/snapshot.jpg", "r"));
    }
    ?>
</body>

</html>