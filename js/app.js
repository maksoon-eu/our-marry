document.addEventListener('DOMContentLoaded', function () {
  initReveal();
  initRsvpForm();
  initAddressCopy();
});

function initReveal() {
  const revealItems = document.querySelectorAll('.reveal');

  if (!revealItems.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: '0px 0px -8% 0px',
    }
  );

  revealItems.forEach((item) => {
    if (!item.classList.contains('is-visible')) {
      observer.observe(item);
    }
  });
}

function initRsvpForm() {
  const form = document.querySelector('.form__inner-form');
  const radios = document.querySelectorAll('.form__inner-radio');
  const checkboxes = document.querySelectorAll('.form__inner-checkbox');
  const nameInput = document.getElementById('name');
  const message = document.querySelector('.form__inner-log');
  const loader = document.querySelector('.form__btn-loader');
  const buttonText = document.querySelector('.form__btn-text');

  if (!form || !nameInput || !message || !loader || !buttonText) {
    return;
  }

  let attendanceInput = '';
  let drinksInput = [];

  function showMessage(text, type) {
    message.textContent = text;
    message.classList.remove('error', 'good');
    message.classList.add(type);
    message.style.opacity = '1';
  }

  function hideMessage() {
    message.style.opacity = '0';
  }

  function setLoading(isLoading) {
    loader.style.opacity = isLoading ? '1' : '0';
    buttonText.style.opacity = isLoading ? '0' : '1';
  }

  function clearForm() {
    nameInput.value = '';
    attendanceInput = '';
    drinksInput = [];

    radios.forEach((radio) => {
      radio.classList.remove('selected');
    });

    checkboxes.forEach((checkbox) => {
      checkbox.classList.remove('selected');
    });
  }

  radios.forEach((radio) => {
    radio.addEventListener('click', function () {
      radios.forEach((item) => item.classList.remove('selected'));
      this.classList.add('selected');

      attendanceInput = this.getAttribute('data-value') || '';
      hideMessage();

      if (attendanceInput === 'Не приду') {
        drinksInput = [];
        checkboxes.forEach((checkbox) => {
          checkbox.classList.remove('selected');
        });
      }
    });
  });

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('click', function () {
      if (this.hasAttribute('disabled')) {
        return;
      }

      this.classList.toggle('selected');
      hideMessage();

      const value = this.getAttribute('data-value');

      if (!value) {
        return;
      }

      if (this.classList.contains('selected')) {
        drinksInput = Array.from(new Set([...drinksInput, value]));
      } else {
        drinksInput = drinksInput.filter((item) => item !== value);
      }
    });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const nameValue = nameInput.value.trim();
    const shouldChooseDrinks = attendanceInput === 'Приду' && drinksInput.length < 1;

    if (!nameValue || !attendanceInput || shouldChooseDrinks) {
      showMessage('Заполните все поля', 'error');
      return;
    }

    if (attendanceInput === 'Не приду') {
      drinksInput = [];
    }

    const data = new FormData();
    data.append('name', nameValue);
    data.append('attendance', attendanceInput);
    data.append('drinks', drinksInput.join(', '));

    const scriptId = 'AKfycbwL4BV_ADKZ6h1gGaXaPKupmxyW5-uecIbsd2X3k5vYhuvzg3rzzWKBAbQMNEVEaKyu';
    const url = `https://script.google.com/macros/s/${scriptId}/exec`;

    setLoading(true);

    fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      body: data,
    })
      .then(() => {
        setLoading(false);
        showMessage('Данные успешно отправлены', 'good');
        clearForm();

        setTimeout(hideMessage, 3000);
      })
      .catch((error) => {
        console.error('Error:', error);
        setLoading(false);
        showMessage('Ошибка отправки', 'error');

        setTimeout(hideMessage, 3000);
      });
  });
}

function initAddressCopy() {
  const address = document.querySelector('.address');
  const addressText = document.querySelector('.addressText');
  const copyImg = document.querySelector('.copyImg');
  const doneImg = document.querySelector('.doneImg');
  const rejectImg = document.querySelector('.rejectImg');

  if (!address || !addressText || !copyImg || !doneImg || !rejectImg) {
    return;
  }

  address.addEventListener('click', function () {
    const addressTextCopy = addressText.textContent;

    navigator.clipboard
      .writeText(addressTextCopy)
      .then(() => {
        copyImg.style.opacity = 0;
        doneImg.style.opacity = 1;

        setTimeout(() => {
          copyImg.style.opacity = 1;
          doneImg.style.opacity = 0;
        }, 2000);
      })
      .catch(() => {
        copyImg.style.opacity = 0;
        rejectImg.style.opacity = 1;

        setTimeout(() => {
          copyImg.style.opacity = 1;
          rejectImg.style.opacity = 0;
        }, 2000);
      });
  });
}
