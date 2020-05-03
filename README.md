# Order Management System


#### We depoy this projects in the AliCLoud, you can visit [Order Management System](http://tntrpg.com:5000). This is a full-stack project (including front-end in `html/css/javascript/Bootstrap` and back-end in `nodejs/MongoDB`). We create A web that allows retailers to manage all orders/products/clients. Each time when retailers input the message, the database will keep these massages.

#### You also can watch [this video](https://www.youtube.com/watch?v=KWPD5X_TJEg).

#### If you want to play our system, please use the second_edition.js as the backend code.(First_edition is the old version, and the third_edition contains some new features and is not finished yet.)


<img alt="Diagram" src="https://github.com/ourarash/nodejs_fullstack/blob/master/diagram.png?raw=true" width="400" text-align="center">

#### -This is our frontend and backend layout.
<img alt="Diagram" src = "layout.png" width="400" text-align="center">


#### - The frontend is set to send the `creat/edit/delete`  `order/client/product` massage for allowing retailers to manage all business massage. These modification can be sent to the backend using HTTP GET/POST request. 
<img alt="Diagram" src = "main_page.png" width="400" text-align="center">


#### - This is the create new order window for tailer to `input new order`(similar with client/product) massage.
<img alt="Diagram" src = "create_window.png" width="400" text-align="center">


#### - This is the Modify order window for tailer to `modify existed order`(similar with client/product) massage.
<img alt="Diagram" src = "modify_window.png" width="400" text-align="center">



#### - Also, you can sort the table by clicking the table head of any column.

#### - The backend is a simple NodeJS server that processes the HTTP `GET/POST` request, return all former kept massage to frontend in the begining. Atfer it receive the massage created by `input` from frontend, it will keep these changes into `MangoDB database` and returns the result back to the frontend.


### we still need to do:
#### - connect with the these three collections (client/order/product), when the product add/subtract in specific order, the total remaining product number will also substract/add in product page
#### - add password function for user