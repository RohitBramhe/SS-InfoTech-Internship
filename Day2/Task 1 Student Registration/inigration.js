document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    
    if(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const inputs = document.querySelectorAll('input[type="text"], input[type="date"], input[type="password"], input[type="file"], textarea');
            let allFilled = true;
            
            inputs.forEach(function(input) {
                if(!input.value.trim()) {
                    allFilled = false;
                    input.style.borderColor = 'red';
                } else {
                    input.style.borderColor = '';
                }
            });
            
            const gender = document.querySelector('input[name="gender"]:checked');
            if(!gender) {
                allFilled = false;
                alert('Please select Gender');
                return false;
            }
            
            const departments = document.querySelectorAll('input[type="checkbox"]:checked');
            if(departments.length === 0) {
                allFilled = false;
                alert('Please select at least one Department');
                return false;
            }
            
            // Check course selection
            const course = document.querySelector('select[name="course"]').value;
            if(course === '--------------------Select Current Course\'s ---------------------') {
                allFilled = false;
                alert('Please select Course');
                return false;
            }
            
            if(!allFilled) {
                alert('Please fill all required fields');
                return false;
            }
            
            // Show success message
            showSuccess('Registration Successful! ✓');
        });
    }
});

function showSuccess(message) {
    let successBox = document.getElementById('successBox');
    
    if(!successBox) {
        successBox = document.createElement('div');
        successBox.id = 'successBox';
        successBox.style.cssText = 'position: fixed; top: 20px; right: 20px; background-color: #4CAF50; color: white; padding: 20px 30px; border-radius: 5px; font-size: 18px; font-weight: bold; z-index: 1000; box-shadow: 0 4px 8px rgba(0,0,0,0.3);';
        document.body.appendChild(successBox);
    }
    
    successBox.textContent = message;
    successBox.style.display = 'block';

    setTimeout(function() {
        successBox.style.display = 'none';
    }, 3000);
}
