$(document).ready(function () {
  // Initialisation du tableau pour stocker les champs du formulaire
  let formFields = [];
  let tempFields = []; // Tableau pour stocker temporairement les champs avant modification

  async function fetchPost(url, data) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  }

  // Fonction pour générer un UUID
  function generateUUID() {
    return 'xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Function to save form fields in localStorage
  function saveFormFieldsToLocalStorage(formFields) {
    console.log('Before Saving Form Fields:', formFields);
    localStorage.setItem('formFields', JSON.stringify(formFields));
  }

  // Function to load form fields from localStorage
  function loadFormFieldsFromLocalStorage() {
    const storedFields = localStorage.getItem('formFields');
    return storedFields ? JSON.parse(storedFields) : null;
  }

  // Example of initializing and saving form fields
  function initializeFormFields() {
    formFields = loadFormFieldsFromLocalStorage(); // Load form fields from localStorage
    if (!formFields) {
      // If no form fields are in localStorage, set some defaults
      formFields = [
        {
          uuid: generateUUID(),
          label: 'Name',
          type: 'simple-text',
          exampleValue: 'John Doe',
          defaultValue: '',
          description: 'Enter your full name',
          optional: false
        },
        {
          uuid: generateUUID(),
          label: 'Email',
          type: 'email',
          exampleValue: 'example@example.com',
          defaultValue: '',
          description: 'Enter your email address',
          optional: false
        }
        // Add more fields as necessary
      ];

      // Save to localStorage after initialization
      saveFormFieldsToLocalStorage(formFields);
    }

    updateFieldList();
    updateDynamicForm();
  }

  function convertFieldType(vtype) {
    switch (vtype) {
      case 'simple-text':
        return 'text';
      case 'long-text':
        return 'textarea';
      case 'select':
        return 'select';
      case 'boolean':
        return 'checkbox';
      case 'date':
        return 'date';
      case 'time':
        return 'time';
      case 'datetime':
        return 'datetime-local';
      case 'email':
        return 'email';
      case 'number':
        return 'number';
      case 'uuid':
        return 'text';
      case 'integer':
        return 'number';
      case 'float':
        return 'number';
      default:
        return 'text';
    }
  }



  function buildFieldHtml(field) {
    let fieldHtml = '';

    console.log('Field ::::', field);
    

    // Handle text, email, number, date, uuid, integer, and float types
    if (['simple-text', 'email', 'number', 'date', 'uuid', 'integer', 'float'].includes(field.type)) {
      fieldHtml = `<div class="mb-3" data-uuid="${field.uuid}">
        <label for="${field.uuid}" class="form-label">${field.label} ${field.optional ? '(Optionnel)' : ''}</label>
        <input type="${field.type === 'simple-text' ? 'text' : field.type}" class="form-control form-control-lg" id="${field.uuid}" placeholder="${field.exampleValue}" value="${field.defaultValue}">
        ${field.description ? `<small class="form-text text-muted">${field.description}</small>` : ''}
      </div>`;
    }

    // Handle textarea (long-text)
    else if (field.type === 'long-text') {
      fieldHtml = `<div class="mb-3" data-uuid="${field.uuid}">
        <label for="${field.uuid}" class="form-label">${field.label} ${field.optional ? '(Optionnel)' : ''}</label>
        <textarea class="form-control form-control-lg" id="${field.uuid}" rows="3" placeholder="${field.exampleValue}">${field.defaultValue}</textarea>
        ${field.description ? `<small class="form-text text-muted">${field.description}</small>` : ''}
      </div>`;
    }

    // Handle select
    else if (field.type === 'select') {
      const options = field.selectValues.split(';').map(value => `<option value="${value}">${value}</option>`).join('');
      fieldHtml = `<div class="mb-3" data-uuid="${field.uuid}">
        <label for="${field.uuid}" class="form-label">${field.label} ${field.optional ? '(Optionnel)' : ''}</label>
        <select class="form-control form-control-lg" id="${field.uuid}">
          ${options}
        </select>
        ${field.description ? `<small class="form-text text-muted">${field.description}</small>` : ''}
      </div>`;
    }

    // Handle boolean (checkbox)
    else if (field.type === 'boolean') {
      fieldHtml = `<div class="form-check form-check-lg mb-3" data-uuid="${field.uuid}">
        <input class="form-check-input form-check-lg" type="checkbox" id="${field.uuid}" ${field.defaultValue === 'true' ? 'checked' : ''}>
        <label class="form-check-label" for="${field.uuid}">
          ${field.label} ${field.optional ? '(Optionnel)' : ''}
        </label>
        ${field.description ? `<small class="form-text text-muted">${field.description}</small>` : ''}
      </div>`;
    }

    // Handle date, time, and datetime types
    else if (['date', 'time', 'datetime'].includes(field.type)) {
      fieldHtml = `<div class="mb-3" data-uuid="${field.uuid}">
        <label for="${field.uuid}" class="form-label">${field.label} ${field.optional ? '(Optionnel)' : ''}</label>
        <input type="${field.value}" class="form-control form-control-lg" id="${field.uuid}" placeholder="${field.exampleValue}" value="${field.defaultValue}">
        ${field.description ? `<small class="form-text text-muted">${field.description}</small>` : ''}
      </div>`;
    }

    return fieldHtml;
  }

  initializeFormFields();

  // Call to initialize the form fields on page load
  // document.addEventListener('DOMContentLoaded', initializeFormFields);



  // Fonction pour vider le formulaire quand on clique sur le bouton "Ajouter un champ"
  $('#addFieldButton').on('click', function () {
    $('#addFieldForm')[0].reset();
    $('#deleteFieldButton').addClass('d-none'); // Cacher le bouton de suppression
    $('#selectValuesContainer').hide(); // Cacher le champ des valeurs Select
  });

  // Fonction pour ajouter ou modifier un champ
  function saveField() {
    const uuid = $('#addFieldModal').data('editing-id'); // Récupérer l'UUID du champ en cours d'édition
    const label = $('#fieldLabel').val();
    const description = $('#fieldDescription').val();
    const type = $('#fieldType').val();
    const defaultValue = $('#defaultValue').val();
    const exampleValue = $('#exampleValue').val();
    const optional = $('#fieldOptional').val() === 'true';
    const selectValues = $('#selectValues').val();

    // Récupérer les valeurs du formulaire
    const field = {
      uuid: uuid || generateUUID(), // Utiliser UUID pour les nouveaux champs
      label: label,
      description: description,
      type: type,
      optional: optional,
      defaultValue: defaultValue,
      exampleValue: exampleValue,
      selectValues: selectValues || ''
    };

    if (uuid) {
      // Modifier un champ existant
      const index = formFields.findIndex(f => f.uuid === uuid);
      if (index !== -1) {
        formFields[index] = field;
      }
    } else {
      // Ajouter un nouveau champ
      formFields.push(field);
    }

    // Mettre à jour l'affichage des champs
    updateFieldList();
    updateDynamicForm();

    // Ferme le modal et réinitialise le formulaire
    $('#addFieldModal').modal('hide');
    $('#addFieldForm')[0].reset();
    $('#selectValuesContainer').hide(); // Cache le champ des valeurs Select
    $('#addFieldModal').removeData('editing-id'); // Nettoyer l'UUID d'édition
    tempFields = []; // Réinitialiser le tableau temporaire après sauvegarde
  }

  // Fonction pour réinitialiser le formulaire dynamique et afficher les champs
  function updateDynamicForm() {
    $('#dynamicForm').empty(); // Supprimer les anciens champs

    formFields.forEach((field) => {
      let fieldHtml = buildFieldHtml(field);
      console.log('Field HTML:', fieldHtml);


      // Ajouter le champ au formulaire
      $('#dynamicForm').append(fieldHtml);
    });

    saveFormFieldsToLocalStorage(formFields); // Sauvegarder les champs dans localStorage
  }

  // Fonction pour mettre à jour l'affichage des champs
  function updateFieldList() {
    const fieldList = $('#fieldList');
    fieldList.empty();

    formFields.forEach((field) => {
      fieldList.append(`
        <li class="list-group-item border border-primary" data-uuid="${field.uuid}">
          <span class="float-left">${field.label} - ${field.type}</span>
          <br>
          <button class="btn btn-danger btn-sm mt-2 float-right d-none" onclick="openDeleteModal('${field.uuid}')">Supprimer</button>
          <span class="badge badge-info float-right">${field.uuid}</span>
        </li>
      `);
    });

    // Activer la fonctionnalité de glisser-déposer
    $('#fieldList').sortable({
      update: function (event, ui) {
        // Mettre à jour l'ordre des éléments dans le tableau formFields
        const newOrder = $(this).sortable('toArray', { attribute: 'data-uuid' });
        const reorderedFields = [];
        newOrder.forEach(id => reorderedFields.push(formFields.find(field => field.uuid === id)));
        formFields.splice(0, formFields.length, ...reorderedFields);
        console.log('Updated Form Fields Array:', formFields);

        updateDynamicForm(); // Mettre à jour le formulaire dynamique après réorganisation
      }
    });
  }

  // Fonction pour afficher le modal avec les valeurs d'un champ
  function showFieldModal(field) {
    $('#fieldLabel').val(field.label);
    $('#fieldDescription').val(field.description);
    $('#fieldType').val(field.type).trigger('change');
    $('#defaultValue').val(field.defaultValue);
    $('#exampleValue').val(field.exampleValue);
    $('#selectValues').val(field.selectValues);
    $('#fieldOptional').val(field.optional ? 'true' : 'false');

    // afficher le bouton #deleteFieldButton
    $('#deleteFieldButton').removeClass('d-none');

    // Afficher le modal
    $('#addFieldModal').modal('show');

    // Définir l'UUID du champ à éditer
    $('#addFieldModal').data('editing-id', field.uuid);
  }

  // Événement de clic sur un élément de la liste pour éditer
  $('#fieldList').on('click', 'li', function () {
    const uuid = $(this).data('uuid');
    const field = formFields.find(f => f.uuid === uuid);

    if (field) {
      // Sauvegarder l'état actuel des champs avant modification
      tempFields = JSON.parse(JSON.stringify(formFields));
      showFieldModal(field);
    }
  });

  // Fonction pour réinitialiser les champs du formulaire
  function resetForm() {
    formFields.splice(0, formFields.length, ...tempFields);
    updateFieldList();
    updateDynamicForm();
    $('#addFieldModal').modal('hide');
    $('#addFieldForm')[0].reset();
    $('#selectValuesContainer').hide(); // Cache le champ des valeurs Select
    $('#addFieldModal').removeData('editing-id'); // Nettoyer l'UUID d'édition
    tempFields = []; // Réinitialiser le tableau temporaire
  }

  // Événement de clic sur le bouton d'annulation du modal
  $('#cancelButton').on('click', function () {
    resetForm();
  });

  // Événement de soumission du formulaire du modal
  $('#addFieldForm').on('submit', function (event) {
    event.preventDefault();
    saveField(); // Appeler la fonction de sauvegarde
  });

  // Evenement de clic sur le bouton de suppression
  $('#deleteFieldButton').on('click', function () {
    const uuid = $('#addFieldModal').data('editing-id');
    const index = formFields.findIndex(f => f.uuid === uuid);
    if (index !== -1) {
      formFields.splice(index, 1);
      updateFieldList();
      updateDynamicForm();
      $('#addFieldModal').modal('hide');
      $('#addFieldForm')[0].reset();
      $('#addFieldModal').removeData('editing-id'); // Nettoyer l'UUID d'édition
    }
  });

  // Initialiser les valeurs des éléments de formulaire lors du chargement
  $('#fieldType').on('change', function () {
    const selectValuesContainer = $('#selectValuesContainer');
    selectValuesContainer.toggle($(this).val() === 'select');
  });

  // Vider le formulaire et cacher le champ des valeurs Select
  $('#resetFormButton').on('click', function () {
    formFields = [];
    updateFieldList();
    updateDynamicForm();
    $('#resetFormModal').modal('hide');
  });

  // Sauvegarder les champs vers le serveur
  $('#saveFormButton').on('click', function () {

    // Vider le message d'erreur
    $('#saveFormErrorAlert').empty().addClass('d-none');

    // Enregistrer les champs dans localStorage
    saveFormFieldsToLocalStorage(formFields);

    // let formProject = $('#formProject').val();
    let formName = $('#formName').val();
    let formDescription = $('#formDescription').val();

    let form = {
      // project: formProject,
      name: formName,
      description: formDescription,
      fields: formFields
    };
    // localStorage.setItem('form', JSON.stringify(form));
    console.log('Form Saved:', form);

    // Enregistrer le formulaire sur le serveur
    fetchPost('/admin/create', form)
      .then(response => {
        if (response.success) {
          console.log('Response Message:', response.message);
          // Mettre à jour l'affichage des champs
          updateFieldList();
          updateDynamicForm();

          // Afficher un message de succès
          $('#saveSuccessAlert').fadeIn(500).delay(2000).fadeOut(500);

          // Fermer le modal
          $('#saveFormModal').modal('hide');

          localStorage.removeItem('formFields'); // Supprimer les champs du formulaire après enregistrement

          // apres l'affichage du message d'erreur, rediriger vers une page
          setTimeout(() => {
            window.location.href = '/admin/' + response.data.uuid;
          }, 3500);
        } else {
          // aficher un message d'erreur alert-danger
          console.log('Error:', response.message);

          // Afficher un message d'erreur
          $('#saveFormErrorAlert').append(
            `<div class="alert alert-danger alert-dismissible fade show" role="alert">
              <strong>Erreur:</strong> ${response.message}
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`
          ).removeClass('d-none');
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });


  });


});
