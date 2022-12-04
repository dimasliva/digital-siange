function defaultItemRenderer(element, data, defaultAction){
    element.className = 'list-item';
    var itemIcon = document.createElement('div');
    itemIcon.className = 'list-item-icon';
    itemIcon.style.backgroundImage = 'url(' + data.image + ')';
    itemIcon.style.cursor = 'pointer';
    itemIcon.onclick = defaultAction;
    var itemCaption = document.createElement('div');
    itemCaption.className = 'list-item-caption';
    itemCaption.innerHTML = data.text;
    itemCaption.style.cursor = 'pointer';
    itemCaption.onclick = defaultAction;
    element.appendChild(itemIcon);
    element.appendChild(itemCaption);
}

function Observable(){
    this._callbacks = {};
    this.on = function(event, callback) {
        if(event in this._callbacks){
            this._callbacks[event].push(callback);
        } else {
            this._callbacks[event] = [callback];
        }
    };
    this.fire = function(event, data){
        if(event in this._callbacks){
            this._callbacks[event].forEach(function(cb){ return cb(data); })
        }
    };
}
/*
"Компонент" для списка элементов с действиями

== Параметры конструктора

elem:
    HTML элемент в котором будет располагаться список

key:
    Название поля в данных, которое однозначно идентифицирует элемент массива данных.
    При отсутствии используется индекс элемента в массиве.

transform:
    Функция преобразующая элемент массива данных в описание используемое для отображения.
    Принимает элемент массива данных, должна возвращать объект следующего формата:
    {
        image: <путь к "иконке" элемента в списке>,
        text: <текст элемента, вставляется как HTML (можно внутри использовать теги)>,
        actions: <массив, содержащий список названий действий доступных для этого элемента>,
        defaultAction: <название действия, которое будет вызываться по клику по иконке или названию (может отсутствовать в actions)>,
        selectable: <опциональное, при значении false элемент нельзя выбрать в списке>,
        class: <опционально, css класс, который будет применен к элементу списка>
    }

actions:
    Объект, содержащий действия над элементами списка.
    Формат:
    {
        <название действия>: {
            icon: <путь к иконке, которая будет отображаться для кнопки действия>,
            label: <поясняющий текст для кнопки действия>,
            handler: <обработчик, первым аргументом принимает элемент списка, вторым аргументом - его индекс>
        },
        ...
    }

multiselect:
    Boolean параметр, при true добавляет чекбоксы к пунктам списка, выбранные элементы доступны в selectedItems

== Методы

update(dataArray):
    Обновляет массив с данными

add(dataItem):
    Добавить элемент в массив данных

moveUp(index):
    Переместить указанный элемент в списке вверх

moveDown(index):
    Переместить указанный элемент в списке вверх

clearSelect():
    Сбросить выбранные элементы

cut(key):
    Вернуть элемент по "ключу" и удалить из списка

get(key):
    Вернуть элемент по "ключу"
*/

function BasicListView(opts){
    Observable.call(this);
	this.container = opts.elem || document.createElement('div');
    this.keyField = opts.key || null;
    this.itemRender = opts.itemRender || defaultItemRenderer;
    this.transform = opts.transform;
    this.actions = opts.actions;
    this.data = [];
	this.dom = [];
    this.multiselect = opts.multiselect || false;
    this.selectedItems = [];
    this.update = function(data){
        this.data = data.slice();
        this.fire('change');
        this.render();
    };
    this.add = function(item){
        this.data.push(item);
        this.fire('change');
        this.render();
    };
    this.moveUp = function(index){
        if((index < 1) || (index >= this.data.length))
    		return false;
    	var item = this.data.splice(index - 1, 1)[0];
    	this.data.splice(index, 0, item);
        this.fire('change');
    	this.render();
    };
    this.moveDown = function(index){
        if((index < 0) || (index >= this.data.length - 1))
    		return false;
    	var item = this.data.splice(index, 1)[0];
    	this.data.splice(index + 1, 0, item);
        this.fire('change');
    	this.render();
    };
    this.select = function(key){
        var index = this.selectedItems.indexOf(key);
        if(index == -1){
            this.selectedItems.push(key);
        }
        this.fire('select');
    };
    this.clearSelect = function(){
        this.selectedItems = [];
        var checkboxen = this.container.querySelectorAll('input[type=checkbox]');
        for(var i = 0; i < checkboxen.length; i++){
            checkboxen[i].checked = false;
        }
        this.fire('select');
    }
    this.deselect = function(key){
        var index = this.selectedItems.indexOf(key);
        if(index != -1){
            this.selectedItems.splice(index, 1);
        }
        this.fire('select');
    };
    this.cut = function(key){
        var retval = null;
        if(this.keyField == null){ // use index
            retval = this.data.splice(key, 1)[0];
        } else {
            for(var i = 0; i < this.data.length; i++){
                if(this.data[this.keyField] == key){
                    retval = this.data.splice(i, 1)[0];
                    break;
                }
            }
        }
        this.render();
        return retval;
    };
    this.get = function(key){
        if(this.keyField == null){ // use index
            return this.data[key];
        } else {
            for(var i = 0; i < this.data.length; i++){
                if(this.data[i][this.keyField] == key){
                    return this.data[i];
                }
            }
        }
        return null;
    };
    this.render = function(){
        this.container.innerHTML = '';
        for(var i = 0; i < this.data.length; i++){
            var viewData = this.transform(this.data[i]);
            var item = document.createElement('div');
            var itemKey = (this.keyField == null) ? i : this.data[i][this.keyField];
            if(viewData.defaultAction){
                var defaultAction = this.actions[viewData.defaultAction].handler.bind(null, this.data[i], i);
            } else {
                var defaultAction = function(){};
            }
            
            // item.addEventListener('dblclick', defaultAction);

            var itemButtons = document.createElement('div');
            itemButtons.className = 'list-item-buttons';
            this.itemRender(item, viewData, defaultAction);
            if(viewData.class){
                item.classList.add(viewData.class);
            }
            var itemActions = viewData.actions;
            for(var j = 0; j < itemActions.length; j++){
                var actionId = itemActions[j];
                var actionButton = document.createElement('button');
                actionButton.type = 'button';
                actionButton.addEventListener('click', this.actions[actionId].handler.bind(null, this.data[i], i));
                actionButton.title = this.actions[actionId].label;
                actionButton.innerHTML = '<img src="' + this.actions[actionId].icon + '" />';
                if(this.actions[actionId].css){
                    actionButton.classList.add(this.actions[actionId].css);
                }
                itemButtons.appendChild(actionButton);
            }
            item.appendChild(itemButtons);

            if(this.multiselect){
                var itemCheckboxContainer = document.createElement('div');
                itemCheckboxContainer.className = 'list-item-checkbox';
                var itemCheckbox = document.createElement('input');
                itemCheckbox.type = 'checkbox';
                itemCheckbox.style.visibility = (viewData.selectable === false) ? 'hidden' : 'visible';
                itemCheckbox.checked = (itemKey in this.selectedItems) ? this.selectedItems[itemKey] : false;
                itemCheckbox.addEventListener('click', function(key, e){
                    if(e.target.checked){
                        this.select(key);
                    } else {
                        this.deselect(key);
                    }
                }.bind(this, itemKey));
                itemCheckboxContainer.appendChild(itemCheckbox);
                item.insertBefore(itemCheckboxContainer, item.firstChild);
            }

            this.container.appendChild(item);
        }
    };
}
