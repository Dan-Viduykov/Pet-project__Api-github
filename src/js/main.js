const debounce = (fn, debounceTime) => {
    let timeout;

    return function () {
        const fnApply = () => { fn.apply(this, arguments)};
        clearTimeout(timeout);
        timeout = setTimeout(fnApply, debounceTime)
    }
};

const input = document.querySelector("#input");
const output = document.querySelector("#output");
const repositoriesList = document.querySelector("#repositories-list");


// todo <_ обработчик на ввод текста в поисковую строку _> =====================================================
input.addEventListener("input", debounce(getResponse, 250));



// todo <_ получаем список из 5 репозиториев по запросу _> =====================================================
let arrRepositories = []

function getResponse() {
    if (input.value) {
        fetch( getUrl( input.value) )
            .then(response => response.json())
            .then(repositories => {
                arrRepositories = repositories.items
                outRepositories(arrRepositories)
            })
            .catch(err => console.log(err))
    } else {
        output.innerHTML = "";
    }
}

function getUrl(query) {
    let q = `q=${query}&sort=stars&order=desc&per_page=5`;
    let url = `https://api.github.com/search/repositories?${q}`;
    
    return url;
}



// todo <_ выводим на страницу ответ запроса _> =====================================================
function outRepositories(repositories) {
    output.innerHTML = '';

    for (const repository of repositories) {
        output.append( createLi(repository) )
    }
}

function createLi(repository) {
    const li = document.createElement("li");

    li.classList.add("search__output-item");
    li.setAttribute("id", repository.id);
    li.textContent = repository.name;

    return li;
}



// todo <_ добавление репозитория в свою колекцию _> =====================================================
let arrayAddRepositories = new Set();
output.addEventListener("click", function(event) {
    if (event.target.tagName === "LI") {
        repositoriesList.innerHTML = "";
        output.innerHTML = "";
        input.value = "";

        let current = arrRepositories.find(item => item.id == event.target.id);
        let isValid = [...arrayAddRepositories].find(item => item.id == current.id);
        
        if (!isValid) {
            arrayAddRepositories.add(current);
        }
        arrayAddRepositories.forEach(item => {
            repositoriesList.append( createElem(item) )
        })
    }
})

function createElem(element) {
    let li = document.createElement("li");

    li.classList.add("repository");
    li.setAttribute("data-identificator", element.id)
    li.innerHTML = `
        <div class="repository__info">
            <p class="repository__name">name: <strong>${element.name}</strong></p>
            <p class="repository__owner">owner: <strong>${element.owner.login}</strong></p>
            <p class="repository__stars">start: <strong>${element.stargazers_count}</strong></p>
        </div>
    `;

    // создание блока с элементами управления ===================================
    const blockAction = document.createElement("div");
    blockAction.classList.add("repository__actions");
    li.append(blockAction)

    // создание кнопки ===================================  
    const buttonDelete = document.createElement("button");
    buttonDelete.classList.add("repository__delete");
    buttonDelete.innerHTML = `
    <span class="top"></span>
    <span class="bottom"></span>
    `
    blockAction.append(buttonDelete)

    // вешаем обработчик событий на кнопку удаления ===================================
    buttonDelete.addEventListener("click", () => {
        for (const item of arrayAddRepositories) {
            if (item.id == li.dataset.identificator) {
                arrayAddRepositories.delete(item);
                li.remove();
            }
        }
    })

    return li;
}