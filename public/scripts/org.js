document.addEventListener('astro:page-load', () => {
    let timeoutId;
    const otherOption = document.getElementById('otherOption');
    const options = document.getElementById('options');
    if (!options || !otherOption) return;

    const classId = options.dataset.classId;
    const groupId = options.dataset.groupId;

    if (!classId || !groupId) {
        console.debug('DEBUG: classId and groupId are required');
        return;
    };

    const sendUpdate = () => {
        const selectedOption = document.querySelector('input[name="option"]:checked');

        const formData = new FormData();
        formData.append('org_value', selectedOption ? selectedOption.value : '');
        if (selectedOption?.value === '3') {
            formData.append('org_answer', otherOption?.value);
        }

        fetch(`/api/quiz/${classId}/${groupId}`, {
            method: 'PUT',
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            console.debug('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    };

    const updateAfterDelay = (callback) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(callback, 1000);
    };

    options.querySelectorAll('input[name="option"]').forEach(input => {
        input.addEventListener('change', () => updateAfterDelay(sendUpdate));
    });

    otherOption.addEventListener('input', () => updateAfterDelay(sendUpdate));
});
