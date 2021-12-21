module.exports = (ref_id) => {
  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
    
        <title>Boursim</title>
    
        <!-- Fonts -->
        <link href="https://fonts.googleapis.com/css?family=Nunito:200,600" rel="stylesheet" />
    
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" />
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    
        <style>
          .modal-confirm .icon-box {
            color: #fff;
            position: absolute;
            margin: 0 auto;
            left: 0;
            right: 0;
            top: -70px;
            width: 95px;
            height: 95px;
            border-radius: 50%;
            z-index: 9;
            background: #82ce34;
            padding: 15px;
            text-align: center;
            box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.1);
          }
    
          @font-face {
            font-family: "fa";
            font-style: normal;
            font-weight: 900;
            font-display: auto;
            src: url(/fonts/fa-solid-900.eot);
            src: url(/fonts/fa-solid-900.eot?#iefix) format("embedded-opentype"),
              url(/fonts/fa-solid-900.woff2) format("woff2"), url(/fonts/fa-solid-900.woff) format("woff"),
              url(/fonts/fa-solid-900.ttf) format("truetype"), url(/fonts/fa-solid-900.svg#fontawesome) format("svg");
          }
          @font-face {
            font-family: "iransans";
            font-style: normal;
            font-weight: 900;
            font-display: auto;
            src: url(/fonts/IranSans.ttf);
          }
    
          .font-fa {
            font-family: iransans, fa;
          }
    
          .material-icons {
            font-family: "Material Icons";
            font-weight: normal;
            font-style: normal;
            font-size: 24px; /* Preferred icon size */
            display: inline-block;
            line-height: 1;
            text-transform: none;
            letter-spacing: normal;
            word-wrap: normal;
            white-space: nowrap;
            direction: ltr;
            /* Support for all WebKit browsers. */
            -webkit-font-smoothing: antialiased;
            /* Support for Safari and Chrome. */
            text-rendering: optimizeLegibility;
    
            /* Support for Firefox. */
            -moz-osx-font-smoothing: grayscale;
    
            /* Support for IE. */
            font-feature-settings: "liga";
          }
    
          .container_1 {
            position: fixed;
            top: 100px;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: 1050;
            display: block;
            overflow: hidden;
            -webkit-overflow-scrolling: touch;
            outline: 0;
            overflow: hidden;
          }
    
          /*.modal-open { overflow: hidden;}*/
        </style>
      </head>
    
      <body class="modal-open font-fa" style="">
        <div id="myModal" class="container_1">
          <div class="modal-dialog modal-confirm">
            <div class="modal-content">
              <div class="modal-header">
                <h4 class="modal-title w-100 font-fa">پرداخت ناموفق</h4>
              </div>
              <div class="modal-body">
                <p class="text-center">عملیات پرداخت موفقیت آمیز نبود</p>
                <p class="text-center">کد پیگیری ${ref_id}</p>
                <p class="text-center">در صورت کسر وجه از حساب بانکی، طی ۷۲ ساعت آینده وجه تراکنش به حساب‌تان برمی‌گردد</p>
              </div>
              <div class="modal-footer">
                <button class="btn btn-danger btn-block">
                  <a href="intent://hokm#Intent;scheme=switch;action=open.app;end" style="text-decoration: none !important; color: white"> بازگشت به اپلیکیشن </a>
                </button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
    `;
};
