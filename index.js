// ok so were going to read in the json file
// then were going to create a new array of only weapon names who's ammo / slot size matches that in the radio button filters
// were then going to set that as the select box options.

const weaponJSON = "./data-files/scrapedWeaponData.json";
const toolJSON = "./data-files/toolsData.json";
const consumablesJSON = "./data-files/consumablesData.json"
let PrimaryWeaponSlotOptions = [];
let SecondaryWeaponSlotOptions = [];
let numberOfToolsSelected=0
let filterSettings ={
    primarySize: "Small",
    primaryCalibre: "Compact",
    secondarySize: "Small",
    secondaryCalibre: "Compact",
}
let equipmentData = {
    weapons: null,
    tools: null,
    consumables: null,
};
    
window.addEventListener("load",function(){
    ///this calls the main scriptfunction once the html contained in the .html has fully loaded.
    organiseDataAndBuilding()
    weaponSlotsSetupRoutine()
    filterWeapons(PrimaryWeaponSlotOptions,"primary")
    filterWeapons(SecondaryWeaponSlotOptions,"secondary")
    ///need to encapsulate event listener code not in functions and call it here
})




/// this section is the file reading and population section///////////////////
async function readJsonfiles(filePath){
    try {response = await fetch(filePath);
        if (!response.ok){
            throw new Error(`Response status: ${response.status}`);
            }
    
        return await response.json();
    }catch (error){
        throw new Error(error.message);
    } 
} 
async function organiseDataAndBuilding(){
    try{ 
        equipmentData.weapons = await readJsonfiles(weaponJSON)
        if (equipmentData.weapons){
            filterWeapons(PrimaryWeaponSlotOptions,"primary")
            filterWeapons(SecondaryWeaponSlotOptions,"secondary")
        }
        
    }catch  (error){
        throw new Error(error.message)
    }
    try{
        equipmentData.tools = await readJsonfiles(toolJSON)
        if (equipmentData.tools){
            makeToolCheckBoxes()
        }
    }catch  (error){
        throw new Error(error.message)
    }
    try{
        equipmentData.consumables = await readJsonfiles(consumablesJSON)
        if (equipmentData.consumables){
            populateConsumableLists()
        }
    }catch  (error){
        throw new Error(error.message)
    }
}

async function makeToolCheckBoxes(){ // loops through tool
    let toolContainer = document.getElementById("toolContainer")
    let toolColumnContainer = document.createElement("div")
    toolContainer.appendChild(toolColumnContainer)
        for(i=0;i<equipmentData.tools.length;i++){
            /* every 5th item we create a new flex box that will hold the checkboxes and their labels in a new column */
            
            if (i%5==0&&i!=0){ 
                toolColumnContainer = document.createElement("div")
                toolColumnContainer.className = "flex flex-col flex-nowrap "
                toolContainer.appendChild(toolColumnContainer)
            }
            let inputAndLabelContainer = document.createElement("div");
            let newLabel = document.createElement("label");
            let newInput = document.createElement("input");

            //setting up input and label container
            inputAndLabelContainer.className = " flex flex-nowrap justify-between gap-2"
            //setting label values
            newLabel.textContent = equipmentData.tools[i].ToolName;
            newLabel.className = "font-Crimson-text text-white"
            //setting input values
            newInput.type = "checkbox";
            newInput.name = equipmentData.tools[i].ToolName;
            newInput.value = equipmentData.tools[i].ToolName;
            newInput.id = equipmentData.tools[i].ToolName;
            inputAndLabelContainer.appendChild(newLabel)
            inputAndLabelContainer.appendChild(newInput)
            toolColumnContainer.appendChild(inputAndLabelContainer)
        }  
        setupCheckBoxes()

}
/////////////////////////this section is the weapon slot section that dynamically filters///////////////////////////////////
function filterUpdated(filterName,filterValue){ 
// this updates the filter settings and the calls to update the filtered result in the appropriate slot select element   
    filterSettings[filterName] = filterValue;
    if(filterName=="primarySize"||filterName=="primaryCalibre"){
        filterWeapons(PrimaryWeaponSlotOptions,"primary");//need to pass primary filter values here
    }else{
        filterWeapons(SecondaryWeaponSlotOptions,"secondary"); //need to pass secondary filter values here
    }
}
    
function filterWeapons(slotOptions,slot){ // called on start and again on each radio button click.
    slotOptions.length = 0 //clears previous slotoption list data

/// this id's what slot has had filteres changed then generates a new list of slotoptions that conform to the new filter settings
    for(i=0;i<equipmentData.weapons.length;i++){
        if (slot=="primary"){
            if (equipmentData.weapons[i].Category==filterSettings.primarySize && equipmentData.weapons[i]["Ammunition Name"] ==filterSettings.primaryCalibre){
                slotOptions.push(equipmentData.weapons[i].WeaponName);
            }
        }
        else{  
            if (equipmentData.weapons[i].Category==filterSettings.secondarySize && equipmentData.weapons[i]["Ammunition Name"] ==filterSettings.secondaryCalibre){
                slotOptions.push(equipmentData.weapons[i].WeaponName);
            }        
        } 
    }
    updateOptions(slot,slotOptions);
}
//// this generates the new slot option elements and using the new slot option list in the weapon slot drop down that had its filter altered.
function updateOptions(slot,slotOptions){
    const slotSelect = document.getElementById(slot);
    slotSelect.innerHTML = "<option value = \"\" text = \"\" ></\"option>"; // clears previous options and adds a blank one
    for(i=0;i<slotOptions.length;i++){
        let newOption = document.createElement("option");
        newOption.value = slotOptions[i];
        newOption.text = slotOptions[i];
        newOption.className = "font-Crimson-text text-sm"
        slotSelect.className = "font-Crimson-text text-red text-sm"
        slotSelect.appendChild(newOption)
            }
/// this  populates the consumables list with option elements read from the json data
}
function populateConsumableLists(){
    const consumableSelectElements = [document.getElementById("consumable1"),document.getElementById("consumable2"),document.getElementById("consumable3"),document.getElementById("consumable4")]
        for(i=0;i<consumableSelectElements.length;i++){
            consumableSelectElements[i].innerHTML = "<option value = \"\" text = \"\" ></\"option>";
            for(j=0;j<equipmentData["consumables"].length;j++){
                let newOption = document.createElement("option")
                newOption.value = equipmentData["consumables"][j]["ConsumableName"];
                newOption.text = equipmentData["consumables"][j]["ConsumableName"];
                newOption.className = "font-Crimson-text text-red text-sm"
                consumableSelectElements[i].className = "font-Crimson-text text-sm"
                consumableSelectElements[i].appendChild(newOption)
            }
        }
}

function weaponSlotsSetupRoutine(){
        /// this sets up our event listeners handling elements getting disabled and form submission
    document.getElementById("loadout").addEventListener("submit",function(event){
        event.preventDefault(); /// so first thing we prevent the default submit behaviour
        
        const form = event.target; // so define what the form activated was... could also do it bit get elementbyid
        const formData = new FormData(form); // we create form data from the form
        // formdata is a js object using the input names as keys.
        const data = Object.fromEntries(formData.entries());
        ////this has converted the formdata object to a js object suitable for sending via fetch 
        console.log(data)
        
    })  
    let primarySizeList = document.getElementsByName("primarySize")
    for(i=0;i<primarySizeList.length;i++){
    primarySizeList[i].addEventListener("click",function(event){
        if (event.target.disabled == false){}
        let secondaryLargeSlotButton = document.getElementById("largeSizeSecondary")
            if (event.target.value == "Large"){

                secondaryLargeSlotButton.disabled = true
            }else{ secondaryLargeSlotButton.disabled = false}   
    })
    }
    let secondarySizeList = document.getElementsByName("secondarySize")
    for(i=0;i<secondarySizeList.length;i++){
        secondarySizeList[i].addEventListener("click",function(event){
        if (event.target.disabled == false){}
        let primaryLargeSlotButton = document.getElementById("largeSizePrimary")
            if (event.target.value == "Large"){

                primaryLargeSlotButton.disabled = true
            }else{ primaryLargeSlotButton.disabled = false}
    })
    }

}
async function setupCheckBoxes(){ /// async cos it depends on the check box to be generated.
    const checkbuttonsfield = document.getElementById("toolContainer")
    console.log(checkbuttonsfield)
    // this is a way to isolate checkboxes specifically when they all have unique names - cos we need that for the form submission.
    const toolCheckBoxes = checkbuttonsfield.querySelectorAll("input")
    console.log(toolCheckBoxes)
    for(i=0;i<toolCheckBoxes.length;i++){
    
    toolCheckBoxes[i].addEventListener("click", function(event){
        console.log("checkbox ticked", toolCheckBoxes)
        let box = event.target;
        if (box.checked){ // this occurs after the box has been checked so its kind of counter intuative...
            ///we just toggled a boxes state and now were checking if its ok to have done that
            if (numberOfToolsSelected>=4){
                alert("You can only select 4 tools at a time")
                box.checked = false;
            }
            else{
                box.checked = true;
                numberOfToolsSelected++
            }

        }else{
            box.checked = false;
            numberOfToolsSelected--;
        }
   
        
        
    })
    
    }
}
