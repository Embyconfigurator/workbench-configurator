const API = "https://script.google.com/macros/s/AKfycbwvpAxCXaWliyxrc8iq5rarTQZT6lnBL5ZbeHpEcaNIvdyV-Tf0WCr2CG-8finVi7Hs/exec";let db = {};
let order = [];

async function loadConfigurator() {

    const response = await fetch(API);
    db = await response.json();

    console.log(db);

fillWidths();

filterWorkbenchTypes();

}
function updateImage(){

    const width = document.getElementById("size").selectedOptions[0].text.replace(" мм","");
    const type = document.getElementById("workbenchType").selectedOptions[0].text;
    const top = document.getElementById("top").value;
    const cab1 = document.getElementById("leftCabinet").value || "";
    const cab2 = document.getElementById("rightCabinet").value || "";

    const photo = db["Фото"].find(item =>

        String(item.Ширина)==String(width) &&
        item.Тип==type &&
        item.Стільниця==top &&
        String(item.Тумба1||"")==String(cab1) &&
        String(item.Тумба2||"")==String(cab2)

    );

   if(photo){

    document.getElementById("workbenchImage").src = photo.Фото;

    updateLayers();

}
}
function fillWidths() {

    const select = document.getElementById("size");

    select.innerHTML = "";

    db["Ширина"].forEach(item => {

        select.innerHTML += `
        <option value="${item.id}">
            ${item.Ширина}
        </option>
        `;

    });

}

function filterWorkbenchTypes(){

    const width = document.getElementById("size").value;

    const select = document.getElementById("workbenchType");

    select.innerHTML = "";

    const types = db["Тип верстака"].filter(item => item.idШирина == width);

    types.forEach(item => {

        select.innerHTML += `
        <option value="${item.id}">
            ${item.Тип}
        </option>`;

});

select.selectedIndex = 0;
filterDetails()
;
calculatePrice();
updateImage();
}

function filterTops(){

    const width = document.getElementById("size").value;

    const select = document.getElementById("top");

    select.innerHTML = "";

    db["Стільниця"]
    .filter(item => item.idШирина == width)
    .forEach(item => {

        select.innerHTML += `
        <option value="${item.Код}">
            ${item.Код} — ${item.Назва}
        </option>
        `;

    });

}
function fillCabinet1() {

    const select = document.getElementById("leftCabinet");

    select.innerHTML = "";

    db["Тумба-1"].forEach(item => {

        select.innerHTML += `
        <option
            value="${item.Код}"
            data-type="${item.idТипВерстака}"
        >
            ${item.Код} — ${item.Назва}
        </option>
        `;

    });

}

function fillCabinet2() {

    const select = document.getElementById("rightCabinet");

    select.innerHTML = "";

    db["Тумба-2"].forEach(item => {

        select.innerHTML += `
        <option
            value="${item.Код}"
            data-type="${item.idТипВерстака}"
        >
            ${item.Код} — ${item.Назва}
        </option>
        `;

    });

}
function fillOptions(){

    const width = document.getElementById("size").value;
    const type = document.getElementById("workbenchType").value;

    const div = document.getElementById("options");

    div.innerHTML = "<h3>Додаткові опції</h3>";

const filtered = db["Опції"].filter(item => {

    console.log(
        "Проверка:",
        item.Назва,
        "idШирина =", item.idШирина,
        "width =", width,
        "idТип =", item.idТипВерстака,
        "type =", type
    );

    return (
        (Number(item.idШирина) === Number(width) || Number(item.idШирина) === 0) &&
        (Number(item.idТипВерстака) === Number(type) || Number(item.idТипВерстака) === 0)
    );

});


filtered.forEach(item=>{

    if(item.Назва.includes("Комплект")){
        console.log(item);
    }
        div.innerHTML += `

<div style="display:flex;align-items:center;gap:10px;height:42px;">
<label style="margin:0;display:flex;align-items:center;gap:8px;width:420px;">

<input
type="checkbox"
data-price="${item.Ціна}"
data-photo="${item.Фото}"
data-x="${item.X || 0}"
data-y="${item.Y || 0}"
data-width="${item.Width || 380}"
onchange="calculatePrice();updateLayers();">

${item.Назва}

</label>

${(
    item.Назва.includes("Нижня перфорована") ||
    item.Назва.includes("Верхня перфорована") ||
    item.Назва.includes("Комплект стійок") ||
    item.Назва.includes("Світильник")
)
? ""
: `
<input
type="number"
class="optionQty"
min="1"
value="1"
style="
width:55px;
height:32px;
padding:2px;
text-align:center;
border:1px solid #bfbfbf;
border-radius:6px;
font-size:15px;
oninput="calculatePrice()">
`}

</div>

`;

    });

}
function updateLayers(){
const backLayers = document.getElementById("backLayers");
const frontLayers = document.getElementById("frontLayers");

backLayers.innerHTML = "";
frontLayers.innerHTML = "";

    document.querySelectorAll("#options input[type=checkbox]:checked").forEach(check=>{

        const photo = check.dataset.photo;
        

        if(!photo) return;

const img = document.createElement("img");
img.src = photo;

console.log(
    "LAYER:",
    photo,
    "width =", check.dataset.width,
    "x =", check.dataset.x,
    "y =", check.dataset.y
);

        // ---------- ПЕРФОПАНЕЛИ И СТОЙКИ ----------
if (
    photo.includes("perf_") ||
    photo.includes("stands")
){

    img.style.left = check.dataset.x + "px";
    img.style.top = check.dataset.y + "px";
    console.log(check.dataset);
    img.style.width = check.dataset.width + "px";

backLayers.appendChild(img);
}
else{

    img.style.left = check.dataset.x + "px";
    img.style.top = check.dataset.y + "px";
    img.style.width = check.dataset.width + "px";

frontLayers.appendChild(img);
}

    });

}
document.getElementById("size").addEventListener("change", filterWorkbenchTypes);
document.getElementById("workbenchType").addEventListener("change", filterDetails);
document.getElementById("top").addEventListener("change", () => {
    calculatePrice();
    updateImage();
});

document.getElementById("leftCabinet").addEventListener("change", () => {
    calculatePrice();
    updateImage();
});

document.getElementById("rightCabinet").addEventListener("change", () => {
    calculatePrice();
    updateImage();
});
loadConfigurator();
function filterDetails(){

    const width = document.getElementById("size").value;
    const type = document.getElementById("workbenchType").value;

    // ---------- СТІЛЬНИЦЯ ----------

    const top = document.getElementById("top");
    top.innerHTML="";

    db["Стільниця"]
    .filter(item=>item.idШирина==width)
    .forEach(item=>{

        top.innerHTML+=`
        <option value="${item.Код}">
            ${item.Код} — ${item.Назва}
        </option>
        `;

    });

    // ---------- ТУМБА-1 ----------

    const cab1=document.getElementById("leftCabinet");
    cab1.innerHTML="";

    db["Тумба-1"]
    .filter(item=>item.idТипВерстака==type)
    .forEach(item=>{

        cab1.innerHTML+=`
        <option value="${item.Код}">
            ${item.Код} — ${item.Назва}
        </option>
        `;

    });

    // ---------- ТУМБА-2 ----------

    const cab2=document.getElementById("rightCabinet");
    cab2.innerHTML="";

    db["Тумба-2"]
    .filter(item=>item.idТипВерстака==type)
    .forEach(item=>{

        cab2.innerHTML+=`
        <option value="${item.Код}">
            ${item.Код} — ${item.Назва}
        </option>
        `;

    });
calculatePrice();
fillOptions();
updateImage();
updateLayers();
}
function calculatePrice(){

    const normalize = value =>
        String(value ?? "")
            .replace(/\u00A0/g, " ")
            .trim()
            .toLowerCase();

    const width = document.getElementById("size")
        .selectedOptions[0]
        .text
        .replace(" мм","")
        .trim();

    const type = document.getElementById("workbenchType")
        .selectedOptions[0]
        .text
        .trim();

    const top = document.getElementById("top").value.trim();

    const cab1 =
        document.getElementById("leftCabinet").value.trim();

    const cab2 =
        document.getElementById("rightCabinet").value.trim();


    const row = db["Ціна"].find(item => {

        return (
            normalize(item.Ширина) === normalize(width) &&
            normalize(item.Тип) === normalize(type) &&
            normalize(item.Стільниця) === normalize(top) &&
            normalize(item.Тумба1) === normalize(cab1) &&
            normalize(item.Тумба2) === normalize(cab2)
        );

    });


    let basePrice = 0;

    if (row) {

        const rawPrice =
            row.Цена ?? row.Ціна ?? 0;

        basePrice = Number(
            String(rawPrice)
                .replace(/\s/g, "")
                .replace(",", ".")
        );

    } else {

        console.warn(
            "НЕ ЗНАЙДЕНА ЦІНА ВЕРСТАКА:",
            {
                width,
                type,
                top,
                cab1,
                cab2
            }
        );

    }


    // Сохраняем отдельно цену самого верстака.
    // Она нам понадобится для красивого блока заказа.
    window.currentBasePrice = basePrice;


    let totalPrice = basePrice;


    document.querySelectorAll(
        "#options input[type=checkbox]"
    ).forEach(check => {

        if(check.checked){

            const qtyInput =
                check.closest("div")
                    .querySelector(".optionQty");

            const qty =
                qtyInput
                ? Number(qtyInput.value) || 1
                : 1;

            totalPrice +=
                Number(check.dataset.price || 0) * qty;

        }

    });


    document.getElementById("price").innerHTML =
        totalPrice.toLocaleString("uk-UA") + " грн";
renderLiveOrderPreview();
}
function renderLiveOrderPreview(){

    const div = document.getElementById("liveOrderPreview");

    if (!div) return;

    const width =
        document.getElementById("size").selectedOptions[0]?.text || "";

    const type =
        document.getElementById("workbenchType").selectedOptions[0]?.text || "";

    const top =
        document.getElementById("top").selectedOptions[0]?.text || "";

    const left =
        document.getElementById("leftCabinet").value || "";

    const right =
        document.getElementById("rightCabinet").value || "";

    const options = [];

    document.querySelectorAll(
        "#options input[type=checkbox]:checked"
    ).forEach(check => {

        const qtyInput =
            check.closest("div")?.querySelector(".optionQty");

        const qty =
            qtyInput ? Number(qtyInput.value) || 1 : 1;

        const unitPrice =
            Number(check.dataset.price || 0);

        options.push({
            name: check.parentNode.textContent.trim(),
            qty: qty,
            unitPrice: unitPrice,
            totalPrice: unitPrice * qty
        });

    });

    const totalPrice = getCurrentPrice();

    const optionsTotal = options.reduce(
        (sum, item) => sum + item.totalPrice,
        0
    );

    const basePrice =
        totalPrice - optionsTotal;

    div.innerHTML = `
        <div style="
            border:1px solid #dcdcdc;
            border-radius:10px;
            padding:15px;
            margin-top:20px;
            margin-bottom:20px;
            background:#fff;
            box-shadow:0 2px 8px rgba(0,0,0,.08);
        ">

            <div style="
                font-size:18px;
                font-weight:bold;
                margin-bottom:12px;
            ">
                Поточна конфігурація
            </div>

            <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                <b>Ширина</b>
                <span>${width}</span>
            </div>

            <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                <b>Тип</b>
                <span>${type}</span>
            </div>

            <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                <b>Стільниця</b>
                <span>${top}</span>
            </div>

            ${
                left
                ? `
                    <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                        <b>Тумба 1</b>
                        <span>${left}</span>
                    </div>
                `
                : ""
            }

            ${
                right
                ? `
                    <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                        <b>Тумба 2</b>
                        <span>${right}</span>
                    </div>
                `
                : ""
            }

            <hr style="margin:12px 0;">

            <b>Опції</b>

            ${
                options.length
                ? options.map(o => `
                    <div style="
                        display:grid;
                        grid-template-columns:1fr auto;
                        gap:12px;
                        padding:8px 0;
                        border-bottom:1px solid #ececec;
                    ">
                        <span>✓ ${o.name}</span>

                        <span style="text-align:right;">
                            ${o.qty} × ${o.unitPrice.toLocaleString("uk-UA")}
                            <br>
                            <b>${o.totalPrice.toLocaleString("uk-UA")} грн</b>
                        </span>
                    </div>
                `).join("")
                : `
                    <div style="color:#777;padding:10px 0;">
                        Опції не вибрані
                    </div>
                `
            }

            <div style="
                margin-top:15px;
                padding-top:12px;
                border-top:1px solid #ddd;
            ">

                <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                    <b>Вартість верстака:</b>
                    <b>${basePrice.toLocaleString("uk-UA")} грн</b>
                </div>

                <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                    <b>Вартість опцій:</b>
                    <b>${optionsTotal.toLocaleString("uk-UA")} грн</b>
                </div>

                <div style="
                    display:flex;
                    justify-content:space-between;
                    border-top:2px solid #222;
                    padding-top:10px;
                    margin-top:10px;
                    font-size:20px;
                    font-weight:bold;
                    color:#e53935;
                ">
                    <span>Разом:</span>
                    <span>${totalPrice.toLocaleString("uk-UA")} грн</span>
                </div>

            </div>

        </div>
    `;
}
function getCurrentPrice(){

    return Number(
        document
            .getElementById("price")
            .innerText
            .replace(/\s/g,"")
            .replace("грн","")
    );

}
let currentWorkbenchAdded = false;
let currentWorkbench = null;
document.getElementById("addWorkbench").addEventListener("click", () => {

    const item = {
        width: document.getElementById("size").selectedOptions[0].text,
        type: document.getElementById("workbenchType").selectedOptions[0].text,
        top: document.getElementById("top").selectedOptions[0].text,
        left: document.getElementById("leftCabinet").value,
        right: document.getElementById("rightCabinet").value,
        basePrice: Number(window.currentBasePrice || 0),
        price: getCurrentPrice(),
        options: []
    };

    document.querySelectorAll("#options input[type=checkbox]").forEach(check => {

        if (check.checked) {

            const qtyInput =
                check.closest("div").querySelector(".optionQty");

            const qty =
                qtyInput ? Number(qtyInput.value) : 1;

            item.options.push({
                name: check.parentNode.textContent.trim(),
                qty: qty,
                unitPrice: Number(check.dataset.price),
                totalPrice:
                    Number(check.dataset.price) * qty
            });

        }

    });

    currentWorkbench = item;

    document.querySelectorAll("#options input[type=checkbox]").forEach(check => {
        check.checked = false;
    });

    document.querySelectorAll(".optionQty").forEach(input => {
        input.value = 0;
    });

    currentWorkbenchAdded = false;

    calculatePrice();
    updateLayers();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});

function renderOrder(){

    const div = document.getElementById("orderItems");

    div.innerHTML = "";

    let total = 0;

    order.forEach((item,index)=>{

        total += item.price;

        div.innerHTML += `

<div style="
border:1px solid #dcdcdc;
border-radius:10px;
padding:15px;
margin-bottom:15px;
background:#fff;
box-shadow:0 2px 8px rgba(0,0,0,.08);
">

<div style="
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:10px;
">

<b>Верстак ${index+1}</b>

<button onclick="removeWorkbench(${index})"
style="
background:#d32f2f;
color:white;
border:none;
padding:6px 12px;
border-radius:6px;
cursor:pointer;
width:auto;
margin:0;
">
Видалити
</button>

</div>

<div style="margin-bottom:15px;line-height:1.8;">

<div style="display:flex;justify-content:space-between;">
<span><b>Ширина</b></span>
<span>${item.width}</span>
</div>

<div style="display:flex;justify-content:space-between;">
<span><b>Тип</b></span>
<span>${item.type}</span>
</div>

<div style="display:flex;justify-content:space-between;">
<span><b>Стільниця</b></span>
<span>${item.top}</span>
</div>

${item.left ? `
<div style="display:flex;justify-content:space-between;">
<span><b>Тумба 1</b></span>
<span>${item.left}</span>
</div>` : ""}

${item.right ? `
<div style="display:flex;justify-content:space-between;">
<span><b>Тумба 2</b></span>
<span>${item.right}</span>
</div>` : ""}

</div>

<hr style="margin:12px 0;">

<b style="font-size:16px;">Опції</b><br><br>

${
item.options.length
? item.options.map(o=>`

<div style="
display:grid;
grid-template-columns: 1fr auto;
gap:12px;
padding:8px 0;
border-bottom:1px solid #ececec;
align-items:center;
">

<div>
✔ ${o.name}
</div>

<div style="text-align:right;white-space:nowrap;">
${o.qty} × ${o.unitPrice.toLocaleString("uk-UA")}
<br>
<b>${o.totalPrice.toLocaleString("uk-UA")} грн</b>
</div>

</div>

`).join("")
: `<div style="color:#777;padding:10px 0;">Опції не вибрані</div>`
}

${(() => {

    const optionsTotal = item.options.reduce(
        (sum, o) => sum + Number(o.totalPrice || 0),
        0
    );

    const basePrice =
        Number(item.basePrice || 0) > 0
        ? Number(item.basePrice)
        : Number(item.price || 0) - optionsTotal;

    return `

        <div style="
            margin-top:18px;
            padding-top:15px;
            border-top:1px solid #ddd;
        ">

            <div style="
                display:flex;
                justify-content:space-between;
                margin-bottom:8px;
                font-size:16px;
            ">
                <span><b>Вартість верстака:</b></span>

                <span>
                    <b>
                        ${basePrice.toLocaleString("uk-UA")} грн
                    </b>
                </span>
            </div>

            <div style="
                display:flex;
                justify-content:space-between;
                margin-bottom:10px;
                font-size:16px;
            ">
                <span><b>Вартість опцій:</b></span>

                <span>
                    <b>
                        ${optionsTotal.toLocaleString("uk-UA")} грн
                    </b>
                </span>
            </div>

            <div style="
                display:flex;
                justify-content:space-between;
                border-top:2px solid #222;
                padding-top:12px;
                margin-top:12px;
                font-size:21px;
                font-weight:bold;
                color:#e53935;
            ">
                <span>Разом:</span>

                <span>
                    ${Number(item.price || 0).toLocaleString("uk-UA")} грн
                </span>
            </div>

        </div>
    `;

})()}
</div>

`;

    });

    document.getElementById("orderTotal").innerHTML =
        total.toLocaleString("uk-UA") + " грн";

}

function removeWorkbench(index){

    order.splice(index,1);

    renderOrder();

}

document.getElementById("downloadPdf").addEventListener("click", async () => {

    if (order.length === 0) {
        alert("Спочатку додайте хоча б один верстак до замовлення.");
        return;
    }

    if (typeof html2canvas === "undefined") {
        alert("Не завантажилася бібліотека для створення PDF.");
        console.error("html2canvas не знайдено");
        return;
    }

    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("Не завантажилася бібліотека PDF.");
        console.error("jsPDF не знайдено");
        return;
    }

    const { jsPDF } = window.jspdf;

let html = `
    <div style="
        font-family: Arial, sans-serif;
        width: 800px;
        padding: 40px;
        box-sizing: border-box;
        background: #ffffff;
        color: #111111;
    ">

<div style="
    height: 35px;
    margin-bottom: 20px;
">
</div>

        <div style="
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 30px;
        ">
            Комерційна пропозиція
        </div>
`;

    order.forEach((item, index) => {

html += `
    <div style="
        border: 1px solid #cccccc;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
        page-break-inside: avoid;
        background: #ffffff;
    ">

        <div style="
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
        ">
            Верстак ${index + 1}
        </div>

        ${
            item.photo
            ? `
                <div style="
                    width: 100%;
                    height: 220px;
                    margin-bottom: 20px;
                    text-align: center;
                ">
                    <img
                        src="${item.photo}"
                        style="
                            max-width: 100%;
                            height: 220px;
                            object-fit: contain;
                            display: inline-block;
                        "
                    >
                </div>
            `
            : ""
        }

                <div style="margin-bottom: 6px;">
                    <b>Ширина:</b> ${item.width}
                </div>

                <div style="margin-bottom: 6px;">
                    <b>Тип:</b> ${item.type}
                </div>

                <div style="margin-bottom: 6px;">
                    <b>Стільниця:</b> ${item.top}
                </div>
        `;

        if (item.left) {
            html += `
                <div style="margin-bottom: 6px;">
                    <b>Тумба 1:</b> ${item.left}
                </div>
            `;
        }

        if (item.right) {
            html += `
                <div style="margin-bottom: 6px;">
                    <b>Тумба 2:</b> ${item.right}
                </div>
            `;
        }

        if (item.options && item.options.length) {

            html += `
                <div style="
                    margin-top: 15px;
                    margin-bottom: 8px;
                    font-weight: bold;
                ">
                    Додаткові опції:
                </div>
            `;

            item.options.forEach(opt => {

                const qty = Number(opt.qty || 1);

                const unitPrice = Number(
                    opt.unitPrice || 0
                );

                const totalPrice = Number(
                    opt.totalPrice || unitPrice * qty
                );

                html += `
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        margin: 6px 0;
                        padding-bottom: 5px;
                        border-bottom: 1px solid #eeeeee;
                    ">

                        <span>
                            ${opt.name}
                        </span>

                        <span style="white-space:nowrap;">
                            ${qty} ×
                            ${unitPrice.toLocaleString("uk-UA")}
                            =
                            <b>
                                ${totalPrice.toLocaleString("uk-UA")} грн
                            </b>
                        </span>

                    </div>
                `;

            });

        }

const optionsTotal = (item.options || []).reduce(
    (sum, opt) => sum + Number(opt.totalPrice || 0),
    0
);

const basePrice =
    Number(item.basePrice || 0) > 0
        ? Number(item.basePrice)
        : Number(item.price || 0) - optionsTotal;

html += `
    <div style="
        margin-top: 18px;
        padding-top: 14px;
        border-top: 1px solid #dddddd;
    ">

        <div style="
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 17px;
        ">
            <span><b>Вартість верстака:</b></span>
            <span><b>${basePrice.toLocaleString("uk-UA")} грн</b></span>
        </div>

        <div style="
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 17px;
        ">
            <span><b>Вартість опцій:</b></span>
            <span><b>${optionsTotal.toLocaleString("uk-UA")} грн</b></span>
        </div>

        <div style="
            display: flex;
            justify-content: space-between;
            border-top: 2px solid #111111;
            padding-top: 12px;
            margin-top: 10px;
            font-size: 20px;
            font-weight: bold;
        ">
            <span>Разом:</span>
            <span>${Number(item.price || 0).toLocaleString("uk-UA")} грн</span>
        </div>

    </div>

</div>
`;

    });

    const total = order.reduce(
        (sum, item) => sum + Number(item.price || 0),
        0
    );

    html += `
            <div style="
                margin-top: 25px;
                padding-top: 15px;
                border-top: 2px solid #111111;
                font-size: 22px;
                font-weight: bold;
                text-align: right;
            ">
                Разом:
                ${total.toLocaleString("uk-UA")} грн
            </div>

        </div>
    `;

    const pdfContainer = document.createElement("div");

    pdfContainer.innerHTML = html;

    /*
       Контейнер должен находиться в DOM
       и быть видимым для html2canvas.
    */

    pdfContainer.style.position = "fixed";
    pdfContainer.style.left = "0";
    pdfContainer.style.top = "0";
    pdfContainer.style.width = "800px";
    pdfContainer.style.background = "#ffffff";
    pdfContainer.style.color = "#111111";
    pdfContainer.style.padding = "0";
    pdfContainer.style.margin = "0";
    pdfContainer.style.zIndex = "999999";
    pdfContainer.style.boxSizing = "border-box";

    document.body.appendChild(pdfContainer);

    try {

        console.log("PDF: починаємо створення canvas");

        const canvas = await html2canvas(pdfContainer, {

            scale: 2,

            useCORS: true,

            allowTaint: true,

            backgroundColor: "#ffffff",

            logging: false,

            scrollX: 0,

            scrollY: 0,

            windowWidth: 800

        });

        console.log(
            "PDF CANVAS:",
            canvas.width,
            canvas.height
        );

        if (!canvas.width || !canvas.height) {

            throw new Error(
                "html2canvas створив порожній canvas"
            );

        }

        const imgData = canvas.toDataURL(
            "image/jpeg",
            0.95
        );

        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        const pageWidth = 210;
        const pageHeight = 297;

        const margin = 10;

        const usableWidth =
            pageWidth - margin * 2;

        const imageWidth = usableWidth;

        const imageHeight =
            canvas.height *
            imageWidth /
            canvas.width;

        let heightLeft = imageHeight;

        let position = margin;

        doc.addImage(
            imgData,
            "JPEG",
            margin,
            position,
            imageWidth,
            imageHeight
        );

        heightLeft -=
            pageHeight - margin * 2;

        while (heightLeft > 0) {

    position =
        margin -
        (imageHeight - heightLeft);

    doc.addPage();

    doc.addImage(
        imgData,
        "JPEG",
        margin,
        position,
        imageWidth,
        imageHeight
    );

    heightLeft -=
        pageHeight - margin * 2;
}

        doc.save(
            "Komertsiyna_propozytsiya.pdf"
        );

        console.log(
            "PDF: успішно створено"
        );

    }

    catch (error) {

        console.error(
            "Помилка створення PDF:",
            error
        );

        alert(
            "Не вдалося створити PDF."
        );

    }

    finally {

        pdfContainer.remove();

    }

});
document.getElementById("addToCart").addEventListener("click", async () => {

    if (currentWorkbenchAdded) {
        document.getElementById("orderList").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
        return;
    }

let previewImage;

try {

    // Берём реально отображаемый верстак и все реально отображаемые слои
    const elements = [
        document.getElementById("workbenchImage"),
        ...document.querySelectorAll("#backLayers img"),
        ...document.querySelectorAll("#frontLayers img")
    ].filter(Boolean);

    if (!elements.length) {
        throw new Error("Немає елементів для створення зображення");
    }

    // Находим общую область всей композиции:
    // верстак + панели + стойки + остальные опции
    const rects = elements.map(el => el.getBoundingClientRect());

    const left = Math.min(...rects.map(r => r.left));
    const top = Math.min(...rects.map(r => r.top));
    const right = Math.max(...rects.map(r => r.right));
    const bottom = Math.max(...rects.map(r => r.bottom));

    const width = right - left;
    const height = bottom - top;

    // Снимаем именно ту область страницы,
    // в которой реально виден готовый верстак со всеми опциями
const oldLeftBackground =
    document.querySelector(".left").style.background;

document.querySelector(".left").style.background = "#ffffff";

const previewCanvas = await html2canvas(document.body, {

    scale: 2,

    useCORS: true,

    backgroundColor: "#ffffff",

    logging: false,

    x: left + window.scrollX,

    y: top + window.scrollY,

    width: width,

    height: height,

    scrollX: 0,

    scrollY: 0

});

document.querySelector(".left").style.background =
    oldLeftBackground;
    previewImage = previewCanvas.toDataURL("image/png");

}
catch (error) {

    console.error(
        "Помилка створення фото верстака:",
        error
    );

    alert(
        "Не вдалося створити фото верстака."
    );

    return;
}
    const item = {
        width: document.getElementById("size").selectedOptions[0].text,
        type: document.getElementById("workbenchType").selectedOptions[0].text,
        top: document.getElementById("top").selectedOptions[0].text,
        left: document.getElementById("leftCabinet").value,
        right: document.getElementById("rightCabinet").value,

        photo: previewImage,
        basePrice: Number(window.currentBasePrice || 0),
        price: getCurrentPrice(),

        options: []
    };

    document.querySelectorAll(
        "#options input[type=checkbox]"
    ).forEach(check => {

        if (check.checked) {

            const qtyInput =
                check.closest("div")?.querySelector(".optionQty");

            const qty =
                qtyInput ? Number(qtyInput.value) : 1;

            item.options.push({
                name: check.parentNode.textContent.trim(),
                qty: qty,
                unitPrice: Number(check.dataset.price),
                totalPrice:
                    Number(check.dataset.price) * qty
            });
        }

    });

    order.push(item);

    currentWorkbenchAdded = true;

    renderOrder();

    document.getElementById("orderList").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

});
document.getElementById("printOrder").addEventListener("click", () => {

    if (order.length === 0) {
        alert("Спочатку додайте хоча б один верстак до замовлення.");
        return;
    }

    let printHtml = `
        <html>
        <head>
            <title>Комерційна пропозиція</title>

            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 30px;
                    color: #111;
                    background: #fff;
                }

                h1 {
                    margin-bottom: 25px;
                }

                .workbench {
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 20px;
                    page-break-inside: avoid;
                }

                .photo {
                    text-align: center;
                    margin-bottom: 20px;
                }

                .photo img {
                    max-width: 350px;
                    max-height: 300px;
                    object-fit: contain;
                }

                .row {
                    margin-bottom: 6px;
                }

                .option {
                    display: flex;
                    justify-content: space-between;
                    border-bottom: 1px solid #eee;
                    padding: 5px 0;
                }

                .price {
                    margin-top: 15px;
                    padding-top: 10px;
                    border-top: 1px solid #ccc;
                    font-size: 18px;
                    font-weight: bold;
                    text-align: right;
                }

                .total {
                    margin-top: 25px;
                    padding-top: 15px;
                    border-top: 2px solid #111;
                    font-size: 22px;
                    font-weight: bold;
                    text-align: right;
                }

                @media print {
                    body {
                        margin: 0;
                    }
                }
            </style>
        </head>

        <body>

            <h1>Комерційна пропозиція</h1>
    `;

    order.forEach((item, index) => {

        printHtml += `
            <div class="workbench">

                <h2>Верстак ${index + 1}</h2>

                ${
                    item.photo
                    ? `
                        <div class="photo">
                            <img src="${item.photo}">
                        </div>
                    `
                    : ""
                }

                <div class="row">
                    <b>Ширина:</b> ${item.width}
                </div>

                <div class="row">
                    <b>Тип:</b> ${item.type}
                </div>

                <div class="row">
                    <b>Стільниця:</b> ${item.top}
                </div>

                ${
                    item.left
                    ? `<div class="row"><b>Тумба 1:</b> ${item.left}</div>`
                    : ""
                }

                ${
                    item.right
                    ? `<div class="row"><b>Тумба 2:</b> ${item.right}</div>`
                    : ""
                }

                ${
                    item.options && item.options.length
                    ? `
                        <div style="margin-top:15px;font-weight:bold;">
                            Додаткові опції:
                        </div>

                        ${item.options.map(opt => `
                            <div class="option">
                                <span>${opt.name}</span>
                                <span>
                                    ${opt.qty} × ${opt.unitPrice.toLocaleString("uk-UA")}
                                    =
                                    <b>${opt.totalPrice.toLocaleString("uk-UA")} грн</b>
                                </span>
                            </div>
                        `).join("")}
                    `
                    : ""
                }

                <div class="price">
                    Вартість верстака:
                    ${Number(item.price || 0).toLocaleString("uk-UA")} грн
                </div>

            </div>
        `;

    });

    const total = order.reduce(
        (sum, item) => sum + Number(item.price || 0),
        0
    );

    printHtml += `
            <div class="total">
                Разом:
                ${total.toLocaleString("uk-UA")} грн
            </div>

        </body>
        </html>
    `;

    const printWindow = window.open("", "_blank");

    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();

    printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
    };

});
document.getElementById("sendEmail").addEventListener("click", () => {

    if (order.length === 0) {
        alert("Спочатку додайте хоча б один верстак до замовлення.");
        return;
    }

    document.getElementById("emailModal").style.display = "flex";

});

document.getElementById("closeEmailModal").addEventListener("click", () => {

    document.getElementById("emailModal").style.display = "none";

});
document.getElementById("submitEmailRequest").addEventListener("click", async () => {

    const name = document.getElementById("clientName").value.trim();
    const phone = document.getElementById("clientPhone").value.trim();
    const email = document.getElementById("clientEmail").value.trim();
    const comment = document.getElementById("clientComment").value.trim();

    if (!name || !phone) {
        alert("Вкажіть ім’я та телефон.");
        return;
    }

    if (order.length === 0) {
        alert("Замовлення порожнє.");
        return;
    }

    const button = document.getElementById("submitEmailRequest");

    button.disabled = true;
    button.textContent = "Надсилаємо...";

    const orderText = order.map((item, index) => {

        let text = `
Верстак ${index + 1}
Ширина: ${item.width}
Тип: ${item.type}
Стільниця: ${item.top}
`;

        if (item.left) {
            text += `Тумба 1: ${item.left}\n`;
        }

        if (item.right) {
            text += `Тумба 2: ${item.right}\n`;
        }

        if (item.options && item.options.length) {

            text += `Опції:\n`;

            item.options.forEach(opt => {

                text +=
                    `- ${opt.name}: ${opt.qty} × ` +
                    `${opt.unitPrice.toLocaleString("uk-UA")} = ` +
                    `${opt.totalPrice.toLocaleString("uk-UA")} грн\n`;

            });

        }

        text +=
            `Вартість верстака: ` +
            `${Number(item.price).toLocaleString("uk-UA")} грн\n`;

        return text;

    }).join("\n------------------------\n");

    const total = order.reduce(
        (sum, item) => sum + Number(item.price || 0),
        0
    );

try {

    const form = document.createElement("form");

    form.method = "POST";
    form.action = API;
    form.target = "emailHiddenFrame";
    form.style.display = "none";

    const fields = {
        action: "sendOrder",
        name: name,
        phone: phone,
        email: email,
        comment: comment,
        order: orderText,
        total: total
    };

    Object.entries(fields).forEach(([key, value]) => {

        const input = document.createElement("input");

        input.type = "hidden";
        input.name = key;
        input.value = value;

        form.appendChild(input);

    });

    document.body.appendChild(form);

    form.submit();

    setTimeout(() => {

        form.remove();

        alert("Запит надіслано!");

        document.getElementById("emailModal").style.display = "none";

        button.disabled = false;
        button.textContent = "📧 Надіслати запит";

    }, 1200);

}
catch (error) {

    console.error("Помилка надсилання:", error);

    alert("Не вдалося надіслати запит.");

    button.disabled = false;
    button.textContent = "📧 Надіслати запит";

}

});
