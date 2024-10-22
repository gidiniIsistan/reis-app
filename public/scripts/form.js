document.addEventListener('astro:page-load', function() {

    // SECTIONS
    const sections = document.querySelectorAll('.section');
    const sectionNumber = document.getElementById('section-number');
    const prevButton = document.getElementById('prev-btn');
    const nextButton = document.getElementById('next-btn');
    const saveButton = document.getElementById('save-btn');//opcional ya que no se renderiza para el modo vista

    if (!sections || !sectionNumber || !prevButton || !nextButton) {
        console.debug('DEBUG: No se encontraron elementos necesarios para la navegación de secciones');
        return;
    };

    let currentSectionIndex = 0;

    const showSection = (index) => {
        // Mostrar la sección correspondiente
        sections.forEach((section, i) => {
            if (i === index) {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
            }
        });
        // Actualizar el número de sección
        sectionNumber.textContent = (index+1).toString();

        // Actualizar la visibilidad de los botones
        switch (index) {
            case 0:
                prevButton.classList.add('hidden');
                break;
            case 1:
                prevButton.classList.remove('hidden');
                nextButton.classList.remove('hidden');
                saveButton?.classList.add('hidden');
                break;
            case sections.length - 1:
                nextButton.classList.add('hidden');
                saveButton?.classList.remove('hidden');
                break;
        }
    };
    
    showSection(currentSectionIndex); // Mostrar la primera sección al cargar la página

    prevButton.addEventListener('click', () => {
        // Mostrar la sección anterior
        if (currentSectionIndex > 0) {
            currentSectionIndex--;
            showSection(currentSectionIndex);
        }
    });

    nextButton.addEventListener('click', () => {
        // Mostrar la siguiente sección
        if (currentSectionIndex < sections.length - 1) {
            currentSectionIndex++;
            showSection(currentSectionIndex);
        }
    });

    saveButton?.addEventListener('click', () => {
        // enviamos el resultado final al back
        const btn = sections[currentSectionIndex].querySelector('button[type="submit"]');
        btn?.click();

        // Redirigir a la página del quiz
        // pathName is /class/:class_id/group/:group_id/dx-question/:dx_question_id
        // goto /class/:class_id/group/:group_id
        const pathParts = window.location.pathname.split('/');
        window.location.href = pathParts.slice(0, 5).join('/');
    });
    //---------------------------------------------------------------

    // PREGUNTA DERIVADA DETALLE
    if (saveButton) {
        const questionDisplay = document.getElementById('question-display');
        const questionInput = document.getElementById('question-input');
        const formContainer = document.querySelector('.form-container');
        const questionsBox = document.getElementById('questions-box');
        let currentCardId = formContainer?.getAttribute('data-id');

        questionInput.addEventListener('input', function() {
            this.style.width = 'auto'; // Reset width
            const newWidth = Math.min(questionInput.scrollWidth, questionInput.parentElement.clientWidth); // Ajusta el ancho máximo al ancho del contenedor
            questionInput.style.width = `${newWidth}px`;
        });

        questionDisplay.addEventListener('click', function() {
            this.classList.add('hidden');
            document.getElementById('question-input').classList.remove('hidden');
            document.getElementById('question-input').focus();
        });

        questionInput.addEventListener('blur', function() {
            const newValue = this.value;
            this.classList.add('hidden');
            questionDisplay.textContent = newValue;
            questionDisplay.classList.remove('hidden');

            // post del valor al back
            const data = new FormData();
            data.append('question', newValue);
            fetch(`/api/dx-question/${currentCardId}`, {
                method: 'PUT',
                body: data
            });

            // Actualizar el contenido de la tarjeta correspondiente
            if (currentCardId !== null) {
                const cardToUpdate = questionsBox.querySelector(`.card-link[data-id="${currentCardId}"] h2`);
                if (cardToUpdate) {
                    cardToUpdate.textContent = newValue;
                }
            }
        });

        questionInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
            e.preventDefault();
            this.blur();
            }
        });
    }
    //---------------------------------------------------------------
});
