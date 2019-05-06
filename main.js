String.prototype.replaceAll = function (search, replacement) {
    const target = this;
    return target.split(search).join(replacement);
};

last = function () {
    return (this.length !== 0) ? this[this.length - 1] : false
};

Array.prototype.last = last;
HTMLCollection.prototype.last = last;

Node.prototype.isEmpty = function () {
    return (this.classList.contains('empty-place'))
};

mouseInElement = (x, y, target) => {
    const rect = target.getBoundingClientRect();
    return (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom - 1)
};


const body = document.querySelector('body');

const emptyColumnHTML = '<div class="column">*</div>';

const addNewColunmHTML =
    '<button class="add-btn js-add-column">' +
    '    <span class="plus">+</span>' +
    '    <span class="add-btn-text">Добавить ещё одну колонку</span>' +
    '</button>';

const addNewCardHTML =
    '<button class="add-btn js-add-card" data-column="*">' +
    '    <span class="plus">+</span>' +
    '    <span class="add-btn-text">Добавить ещё одну карточку</span>' +
    '</button>';

const newCardHTML =
    '<div class="add-card">' +
    '    <textarea class="new-card" rows="3" placeholder="Введите название карточки"></textarea>' +
    '    <button class="add-card-btn js-add-new-card" data-column="*">Добавить карточку</button>' +
    '    <button class="discard">&times;</button>' +
    '</div>';

const addColunmHTML =
    '<div class="add-card js-new-column">' +
    '    <input id="new_column" type="text" class="new-card" placeholder="Введите название колонки">' +
    '    <button class="add-card-btn js-add-new-column">Добавить колонку</button>' +
    '    <button class="discard">&times;</button>' +
    '</div>';

let addColumnButton = undefined;
let createColumnButton = undefined;
let lastColumn = undefined;
let draggedNode = undefined;
let dragStartTarget = undefined;
let shadow = undefined;
let addNewColumnButtonClicked = false;
let columns = [];

class Column {
    constructor(heading, number) {
        this.heading = heading;
        this.number = number;
        this.addNewCardField = false;
        this.cards = [];
    }

    renderHTML() {
        const cardsHTML = this.cards.map((item, index) => (
            `<div class="card" draggable="true" id="${this.number}-${index}">
                ${item.replaceAll('\n', '<br>')}
            </div>`)
        ).join("");
        return (this.addNewCardField)
            ? `<div class="column">
                   <button class="remove-column" data-column="${this.number}">&times;</button>
                   <div class="heading">${this.heading}</div>
                   <div class="cards" id="${this.number}">${cardsHTML}${newCardHTML.replace('*', this.number)}</div>
               </div>`
            : `<div class="column">
                    <button class="remove-column" data-column="${this.number}">&times;</button>
                    <div class="heading">${this.heading}</div>
                    <div class="cards" id="${this.number}">${cardsHTML}</div>
                    ${addNewCardHTML.replace('*', this.number)}
              </div>`
    }
}

let data = (document.cookie === '') ? {columns: []} : JSON.parse(document.cookie);
data.columns.map((item, index) => {
    const heading = item[0];
    columns.push(new Column(heading, index));
    columns[index].cards = item[1]
});

render = () => {
    data = {columns: []};
    columns.map(item => {
        data.columns.push([item.heading, item.cards])
    });
    document.cookie = JSON.stringify(data);
    const renderedColumns = columns.map(item => (item.renderHTML()));
    body.innerHTML = '';
    renderedColumns.forEach(item => {
        body.innerHTML += item
    });
    if (columns.length < 4) {
        body.innerHTML += (addNewColumnButtonClicked)
            ? emptyColumnHTML.replace('*', addColunmHTML)
            : emptyColumnHTML.replace('*', addNewColunmHTML);
    }
    updateEventListeners()
};

addColumn = () => {
    addNewColumnButtonClicked = false;
    const columnTextarea = document.getElementById('new_column');
    const heading = (columnTextarea.value === '') ? 'Без названия' : columnTextarea.value;
    columns.push(new Column(heading, columns.length));
    const addButtons = document.getElementsByClassName('js-new-column');
    addButtons.last().remove();
    render()
};

addCard = (column, cardTextarea) => {
    column.cards.push(cardTextarea.value);
    column.addNewCardField = false;
    render();
};

placeAddColumnField = () => {
    addNewColumnButtonClicked = true;
    addColumnButton.remove();
    lastColumn.innerHTML = addColunmHTML;
    updateEventListeners()
};

discardAdding = e => {
    addNewColumnButtonClicked = (!e.target.parentElement.classList.contains('js-new-column'));
    const cards = e.target.parentElement.parentElement;
    const columnNumber = cards.id;
    const column = columns[columnNumber];
    e.target.parentElement.remove();
    column.addNewCardField = false;
    cards.parentElement.innerHTML += addNewCardHTML.replace('*', columnNumber);
    updateEventListeners()
};

placeAddCardField = e => {
    let button = (e.path[1].classList.contains('js-add-card')) ? e.path[1] : e.path[0];
    const columnNumber = button.dataset.column;
    const column = columns[parseInt(columnNumber)];
    column.addNewCardField = true;
    const cards = document.getElementById(columnNumber);
    button.remove();
    cards.innerHTML += newCardHTML.replace('*', columnNumber);
    cards.scrollTop = cards.scrollHeight;
    updateEventListeners()
};

updateEventListeners =() => {
    const columnsNodes = document.getElementsByClassName('column');
    lastColumn = columnsNodes.last();
    const addColumnButtons = document.getElementsByClassName('js-add-column');
    if (addColumnButtons.length !== 0) {
        addColumnButton = addColumnButtons.last();
        addColumnButton.addEventListener('click', placeAddColumnField);
    }
    const addNewColumnButtons = document.getElementsByClassName('js-add-new-column');
    if (addNewColumnButtons.length !== 0) {
        addNewColumnButtons.last().addEventListener('click', addColumn);
    }
    const addCardButtons = document.getElementsByClassName('js-add-card');
    if (addCardButtons.length !== 0) {
        Array.from(addCardButtons).forEach(item => {
            item.addEventListener('click', placeAddCardField)
        })
    }
    const addNewCardButtons = document.getElementsByClassName('js-add-new-card');
    if (addNewCardButtons.length !== 0) {
        Array.from(addNewCardButtons).forEach(item => {
            item.addEventListener('click', () => {
                const cardTextarea = item.parentElement.childNodes[1];
                addCard(columns[parseInt(item.dataset.column)], cardTextarea)
            })
        })
    }
    const discardButtons = document.getElementsByClassName('discard');
    if (discardButtons.length !== 0) {
        Array.from(discardButtons).forEach(item => {
            item.addEventListener('click', discardAdding)
        })
    }
    const removeColumnButtons = document.getElementsByClassName('remove-column');
    if (removeColumnButtons.length !== 0) {
        Array.from(removeColumnButtons).forEach(item => {
            item.addEventListener('click', e => {
                const columnNumber = parseInt(e.target.dataset.column);
                delete data.columns.splice(columnNumber, 1);
                columns.splice(columnNumber, 1);
                columns.forEach((item, index) => {
                    item.number = index
                });
                render()
            })
        })
    }
    const cardsWrappers = document.getElementsByClassName('cards');
    if (cardsWrappers.length !== 0) {
        Array.from(cardsWrappers).forEach(item => {
            item.addEventListener('dragenter', e => {
                if (e.target === item) {
                    dragStartTarget = e.target;
                    const y = e.clientY;
                    const cardsArray = Array.from(e.target.childNodes);
                    const isLastNodeShadow = !cardsArray.some(cardNode => {
                        if (cardNode.isEmpty() && y < cardNode.getBoundingClientRect().top) {
                            return true
                        }
                        let isPrevNodeEmpty = null;
                        try {
                            isPrevNodeEmpty = cardNode.previousElementSibling.isEmpty()
                        } catch (error) {
                            isPrevNodeEmpty = false;
                        }
                        const rect = cardNode.getBoundingClientRect();
                        if (y < rect.bottom - (rect.height / 2)
                            && !cardNode.isEmpty()
                            && !isPrevNodeEmpty) {
                            e.target.insertBefore(shadow, cardNode);
                            return true
                        }
                    });
                    if (e.target.childNodes.length === 0) {
                        e.target.appendChild(shadow)
                    } else {
                        const lastNodeRect = e.target.lastChild.getBoundingClientRect();
                        if (isLastNodeShadow
                        && !e.target.lastChild.isEmpty()
                        && !e.target.lastChild.classList.contains('add-card')
                        && y > lastNodeRect.bottom - (lastNodeRect.height / 2)) {
                            e.target.appendChild(shadow)
                        }
                    }
                }
            });
            item.addEventListener('dragleave', e => {
                const target = (e.target.classList.contains('cards')) ? e.target : e.target.parentNode;
                if (!mouseInElement(e.clientX, e.clientY, target)) {
                    shadow.remove()
                }
            });
            item.addEventListener('dragover', e => {
                e.preventDefault();
            });
            item.addEventListener('drop', e => {
                e.preventDefault();
                const data = e.dataTransfer.getData('card-id');
                const [fromColumnNumber, cardNumber] = data.split('-').map(item => (parseInt(item)));
                const cardsWrapper = (e.target.classList.contains('cards')) ? e.target : e.target.parentNode;
                const toColumnNumber = parseInt(cardsWrapper.id);
                const cardToPut = columns[fromColumnNumber].cards[cardNumber];
                if (cardsWrapper.lastChild === shadow) {
                    columns[fromColumnNumber].cards.splice(cardNumber, 1);
                    columns[toColumnNumber].cards.push(cardToPut)
                } else if (!e.target.isEmpty() && shadow.nextElementSibling !== null) {
                    const nextCardNumber = parseInt(shadow.nextElementSibling.id.split('-')[1]);
                    columns[fromColumnNumber].cards.splice(cardNumber, 1);
                    columns[toColumnNumber].cards.splice(nextCardNumber, 0, cardToPut);
                }
                render()
            })
        })
    }
    const cards = document.getElementsByClassName('card');
    if (cards.length !== 0) {
        Array.from(cards).forEach(item => {
            item.addEventListener('dragstart', e => {
                draggedNode = e.target;
                setTimeout(() => {
                    const draggedNodeClasses = draggedNode.classList;
                    draggedNodeClasses.add('empty-place');
                    // idk why but turns out that draggedNode.classList.add() is not a function :/
                }, 0);
                shadow = draggedNode.cloneNode(true);
                shadow.classList.add('shadow');
                e.dataTransfer.setData('card-id', e.target.id);
            });
            item.addEventListener('drag', e => {
                if (mouseInElement(e.clientX, e.clientY, e.target)) {
                    shadow.remove()
                }
            });
            item.addEventListener('dragend', e => {
                e.target.classList.remove('empty-place');
            });
        })
    }
};

render();