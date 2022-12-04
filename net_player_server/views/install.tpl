<!doctype html>
<html>
<head>
    <meta charset='utf-8' />
    <title>{{ _('first_start_title') }}</title>
    <link rel='stylesheet' href='/static/start.css' />
    <script src='/static/js/locale.js'></script>
    <script src='/static/js/start.js'></script>
</head>
<body>
    <div class='mainwrap'>
        <form action='/register/' method='post'>
            <h1>{{ _('first_start_title') }}</h1>
            <p>{{ _('first_start_text') }}</p>
            <div id='fs__response'></div>
            <label for='fs__user'>{{ _('first_start_username') }}</label>
            <input id='fs__user' type='text' name='username'>
            <label for='fs__pass'>{{ _('first_start_password') }}</label>
            <input id='fs__pass' type='password' name='password'>
            <label for='fs_repeat'>{{ _('first_start_repeat') }}</label>
            <input id='fs__repeat' type='password'>
            <div>
                <button type='submit'>{{ _('first_start_submit') }}</button>
            </div>
        </form>
    </div>
</body>
</html>
