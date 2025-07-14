// Global Constants
const APP_CONFIG = {
    SWAL_THEME: 'custom-swal',
    PING_INTERVAL: 1000,
    TIME_UPDATE_INTERVAL: 1000,
    TIMEZONE: 'Asia/Manila',
    COMMANDS: [{ commands: [] }, { handleEvent: [] }]
};

// DOM Elements
const DOM = {
    scrollUpBtn: document.getElementById('scrollUpBtn'),
    agreeCheckbox: document.getElementById('agreeCheckbox'),
    submitButton: document.getElementById('submitButton'),
    jsonData: document.getElementById('json-data'),
    inputOfPrefix: document.getElementById('inputOfPrefix'),
    inputOfAdmin: document.getElementById('inputOfAdmin'),
    pingElement: document.getElementById('ping'),
    timeElement: document.getElementById('time'),
    listOfCommands: document.getElementById('listOfCommands'),
    listOfCommandsEvent: document.getElementById('listOfCommandsEvent')
};

// Initialize the application
function init() {
    setupEventListeners();
    startBackgroundTasks();
    commandList();
}

// Set up all event listeners
function setupEventListeners() {
    // Scroll to top button
    window.addEventListener('scroll', handleScroll);
    DOM.scrollUpBtn.addEventListener('click', scrollToTop);
    
    // Terms agreement checkbox
    DOM.agreeCheckbox.addEventListener('change', () => {
        DOM.submitButton.disabled = !DOM.agreeCheckbox.checked;
    });
}

// Start background tasks (ping and time updates)
function startBackgroundTasks() {
    measurePing();
    setInterval(measurePing, APP_CONFIG.PING_INTERVAL);
    
    updateTime();
    setInterval(updateTime, APP_CONFIG.TIME_UPDATE_INTERVAL);
}

// Scroll handler for showing/hiding scroll-to-top button
function handleScroll() {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    if (scrollPosition > 300) {
        DOM.scrollUpBtn.classList.add('show');
        DOM.scrollUpBtn.classList.remove('hide');
    } else {
        DOM.scrollUpBtn.classList.add('hide');
        DOM.scrollUpBtn.classList.remove('show');
    }
}

// Smooth scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Measure ping time to server
function measurePing() {
    const startTime = Date.now();
    fetch(`${location.href}?t=${startTime}`)
        .then(() => {
            const pingTime = Date.now() - startTime;
            DOM.pingElement.textContent = `${pingTime} ms`;
        })
        .catch(error => {
            console.error('Ping measurement failed:', error);
            DOM.pingElement.textContent = 'N/A';
        });
}

// Update current time display
function updateTime() {
    const now = new Date();
    const options = {
        timeZone: APP_CONFIG.TIMEZONE,
        hour12: true,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    };
    DOM.timeElement.textContent = now.toLocaleString('en-US', options);
}

// Show loading alert
function showWaitingAlert() {
    Swal.fire({
        title: 'Loading...',
        text: 'Processing your request please wait...',
        icon: 'info',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
        customClass: { popup: APP_CONFIG.SWAL_THEME }
    });
}

// Show result alert
function showResult(message, isSuccess = false) {
    Swal.fire({
        title: isSuccess ? 'Success!' : 'Result',
        text: message,
        icon: isSuccess ? 'success' : 'info',
        confirmButtonText: 'OK',
        customClass: { popup: APP_CONFIG.SWAL_THEME }
    });
}

// Main submission function
async function State() {
    if (!APP_CONFIG.COMMANDS[0].commands.length) {
        return showResult('Please provide at least one valid command for execution.');
    }
    
    showWaitingAlert();
    DOM.submitButton.style.display = 'none';
    
    try {
        const State = JSON.parse(DOM.jsonData.value);
        if (!State || typeof State !== 'object') {
            throw new Error('Invalid JSON data');
        }
        
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                state: State,
                commands: APP_CONFIG.COMMANDS,
                prefix: DOM.inputOfPrefix.value,
                admin: DOM.inputOfAdmin.value
            })
        });
        
        const data = await response.json();
        DOM.jsonData.value = '';
        showResult(data.message, data.success);
    } catch (error) {
        console.error('Submission error:', error);
        DOM.jsonData.value = '';
        showResult(error.message.includes('JSON') ? 
            'Error parsing JSON. Please check your input.' : 
            'An error occurred during submission.');
    } finally {
        setTimeout(() => {
            DOM.submitButton.style.display = 'block';
        }, 4000);
    }
}

// Fetch and display command list
async function commandList() {
    try {
        const response = await fetch('/commands');
        const { commands, handleEvent, aliases } = await response.json();
        
        renderCommandList(commands, DOM.listOfCommands, 'commands');
        renderCommandList(handleEvent, DOM.listOfCommandsEvent, 'handleEvent');
    } catch (error) {
        console.error('Failed to load commands:', error);
        showResult('Failed to load command list. Please try again later.');
    }
}

// Render command list to DOM
function renderCommandList(commands, container, type) {
    container.innerHTML = '';
    commands.forEach((command, index) => {
        const commandElement = createCommandElement(index + 1, command, type);
        container.appendChild(commandElement);
    });
}

// Create command element
function createCommandElement(order, command, type) {
    const container = document.createElement('div');
    container.className = 'form-check form-switch command-item';
    container.onclick = () => toggleCommandSelection(container, type);
    
    const checkbox = document.createElement('input');
    checkbox.className = `form-check-input ${type}`;
    checkbox.type = 'checkbox';
    checkbox.id = `${type}-${order}`;
    
    const label = document.createElement('label');
    label.className = `form-check-label ${type}`;
    label.htmlFor = checkbox.id;
    label.textContent = `${order}. ${command}`;
    
    container.append(checkbox, label);
    return container;
}

// Toggle command selection
function toggleCommandSelection(element, type) {
    const checkbox = element.querySelector('input');
    const label = element.querySelector('label');
    const commandArray = type === 'commands' ? 
        APP_CONFIG.COMMANDS[0].commands : 
        APP_CONFIG.COMMANDS[1].handleEvent;
    
    checkbox.checked = !checkbox.checked;
    const command = label.textContent.replace(/^\d+\.\s/, '').split(" ")[0];
    
    if (checkbox.checked) {
        label.classList.add('selected');
        commandArray.push(command);
    } else {
        label.classList.remove('selected');
        const index = commandArray.indexOf(command);
        if (index !== -1) commandArray.splice(index, 1);
    }
}

// Select all commands of a type
function toggleAllCommands(type, selectAll = true) {
    const checkboxes = document.querySelectorAll(`.form-check-input.${type}`);
    const commandArray = type === 'commands' ? 
        APP_CONFIG.COMMANDS[0].commands : 
        APP_CONFIG.COMMANDS[1].handleEvent;
    
    checkboxes.forEach(checkbox => {
        const label = checkbox.nextElementSibling;
        const command = label.textContent.replace(/^\d+\.\s/, '').split(" ")[0];
        
        if (selectAll) {
            if (!checkbox.checked) {
                checkbox.checked = true;
                label.classList.add('selected');
                if (!commandArray.includes(command)) {
                    commandArray.push(command);
                }
            }
        } else {
            if (checkbox.checked) {
                checkbox.checked = false;
                label.classList.remove('selected');
                const index = commandArray.indexOf(command);
                if (index !== -1) commandArray.splice(index, 1);
            }
        }
    });
}

// Wrapper functions for UI actions
function selectAllCommands() {
    const allSelected = Array.from(document.querySelectorAll('.form-check-input.commands'))
        .every(checkbox => checkbox.checked);
    toggleAllCommands('commands', !allSelected);
}

function selectAllEvents() {
    const allSelected = Array.from(document.querySelectorAll('.form-check-input.handleEvent'))
        .every(checkbox => checkbox.checked);
    toggleAllCommands('handleEvent', !allSelected);
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
