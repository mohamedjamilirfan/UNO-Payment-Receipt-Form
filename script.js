document.addEventListener('DOMContentLoaded', () => {
  // Date Formatting and Updating
  const englishDateInput = document.getElementById('english-date');
  const formattedEnglishDateSpan = document.getElementById(
    'formatted-english-date'
  );
  const arabicDateSpan = document.getElementById('arabic-date');

  const formatEnglishDate = (date) =>
    `${String(date.getDate()).padStart(2, '0')}/${String(
      date.getMonth() + 1
    ).padStart(2, '0')}/${date.getFullYear()}`;

  englishDateInput.addEventListener('change', () => {
    const selectedDate = new Date(englishDateInput.value);
    if (!isNaN(selectedDate)) {
      arabicDateSpan.textContent = formatArabicDate(selectedDate);
      formattedEnglishDateSpan.textContent = formatEnglishDate(selectedDate);
    }
  });

  // Reference Number Updating
  const englishRefInput = document.getElementById('english-ref');
  const formattedEnglishRefSpan = document.getElementById(
    'formatted-english-ref'
  );
  const arabicRefSpan = document.getElementById('arabic-ref');

  englishRefInput.addEventListener('input', () => {
    const refValue = englishRefInput.value;
    formattedEnglishRefSpan.textContent = refValue;
    arabicRefSpan.textContent = refValue;
  });

  // Amount to Words Conversion
  const amountInput = document.getElementById('amount-input');
  const amountText = document.getElementById('amount-text');
  const amountNumericDisplay = document.createElement('span');
  amountNumericDisplay.id = 'amount-numeric-display';
  amountNumericDisplay.style.display = 'none'; // Ensure visibility during PDF rendering
  amountInput.parentElement.appendChild(amountNumericDisplay);

  const numberToWords = (num) => {
    const units = [
      '',
      'ONE',
      'TWO',
      'THREE',
      'FOUR',
      'FIVE',
      'SIX',
      'SEVEN',
      'EIGHT',
      'NINE',
    ];
    const teens = [
      'ELEVEN',
      'TWELVE',
      'THIRTEEN',
      'FOURTEEN',
      'FIFTEEN',
      'SIXTEEN',
      'SEVENTEEN',
      'EIGHTEEN',
      'NINETEEN',
    ];
    const tens = [
      '',
      'TEN',
      'TWENTY',
      'THIRTY',
      'FOURTY',
      'FIFTY',
      'SIXTY',
      'SEVENTY',
      'EIGHTY',
      'NINETY',
    ];
    const thousands = ['', 'THOUSAND', 'MILLION', 'BILLION', 'TRILLION'];

    const getChunkWords = (chunk) => {
      let chunkWords = '';
      if (chunk >= 100) {
        chunkWords += `${units[Math.floor(chunk / 100)]} HUNDRED `;
        chunk %= 100;
      }
      if (chunk > 10 && chunk < 20) {
        chunkWords += `${teens[chunk - 11]} `;
      } else {
        chunkWords += `${tens[Math.floor(chunk / 10)]} ${units[chunk % 10]} `;
      }
      return chunkWords.trim();
    };

    if (num === 0) return 'ZERO DIRHAMS ONLY';

    let words = '';
    let chunkCount = 0;

    while (num > 0) {
      const chunk = num % 1000;
      if (chunk > 0) {
        words = `${getChunkWords(chunk)} ${
          thousands[chunkCount]
        } ${words}`.trim();
      }
      num = Math.floor(num / 1000);
      chunkCount++;
    }

    return `${words} ONLY`;
  };

  amountInput.addEventListener('input', () => {
    const amount = parseInt(amountInput.value, 10) || 0;
    amountText.textContent = numberToWords(amount);
    amountNumericDisplay.textContent = amount.toLocaleString(); // Display numeric amount
  });

  const uploadingSignatureButton = document.getElementById(
    'uploading-signature'
  );
  const signatureBox = document.querySelector('.signature-box');

  uploadingSignatureButton.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();

        reader.onload = (e) => {
          signatureBox.style.backgroundImage = `url(${e.target.result})`;
          signatureBox.style.backgroundSize = 'contain';
          signatureBox.style.backgroundRepeat = 'no-repeat';
          signatureBox.style.backgroundPosition = 'center';
        };

        reader.readAsDataURL(file);
      }
    });

    input.click();
  });

  const chequeCheckbox = document.getElementById('cheque-checkbox');
  const cashCheckbox = document.querySelector(
    'input[type="checkbox"][name="option"]:not(#cheque-checkbox)'
  );
  const chequeInput = document.getElementById('cheque-input');
  const formattedChequeSpan = document.getElementById('formatted-cheque');

  function toggleChequeInput(checkbox) {
    if (checkbox === chequeCheckbox && chequeCheckbox.checked) {
      chequeInput.style.display = 'inline-block'; // Show cheque input
      chequeInput.required = true; // Make it required
      cashCheckbox.checked = false; // Uncheck the "Cash" checkbox
    } else if (checkbox === cashCheckbox && cashCheckbox.checked) {
      chequeInput.style.display = 'none'; // Hide cheque input
      chequeInput.required = false; // Remove required attribute
      chequeInput.value = ''; // Clear its value
      chequeCheckbox.checked = false; // Uncheck the "Cheque" checkbox
    }
  }

  chequeCheckbox.addEventListener('change', () =>
    toggleChequeInput(chequeCheckbox)
  );
  cashCheckbox.addEventListener('change', () =>
    toggleChequeInput(cashCheckbox)
  );

  // PDF Download Functionality
  const downloadBtn = document.getElementById('download-pdf');
  const nameInput = document.getElementById('name-input');
  const titleSelect = document.getElementById('title-select');
  const formattedNameSpan = document.getElementById('formatted-name');

  downloadBtn.addEventListener('click', () => {
    const chequeCheckbox = document.getElementById('cheque-checkbox');
    const chequeInput = document.getElementById('cheque-input');
    const formattedChequeSpan = document.createElement('span');
    formattedChequeSpan.textContent = chequeInput.value;
    formattedChequeSpan.style.display = 'inline-block';
    formattedChequeSpan.style.fontWeight = 'bold';
    formattedChequeSpan.style.border = '1px solid rgba(0, 0, 0, 0.3)';
    formattedChequeSpan.style.padding = '1px 35px 4px 6px';
    formattedChequeSpan.style.borderRadius = '5px';

    // Replace input with span for PDF generation
    if (chequeCheckbox.checked) {
      chequeInput.style.display = 'none';
      chequeInput.parentElement.insertBefore(formattedChequeSpan, chequeInput);
    }

    const receiptTypeSelect = document.getElementById('receipt-type');

    // Hide the dropdown
    receiptTypeSelect.style.display = 'none';

    const receiptContainer = document.querySelector('.receipt-container');

    // Ensure the date format is updated before PDF generation
    const englishDateInput = document.getElementById('english-date');
    const formattedEnglishDateSpan = document.getElementById(
      'formatted-english-date'
    );

    // Convert the date input to "DD/MM/YYYY" format
    const selectedDateValue = englishDateInput.value;
    if (selectedDateValue) {
      const [year, month, day] = selectedDateValue.split('-');
      const formattedDate = `${day}/${month}/${year}`; // Format the date as "DD/MM/YYYY"

      // Set this formatted date to the span element
      formattedEnglishDateSpan.textContent = formattedDate;
      formattedEnglishDateSpan.style.display = 'none';
      englishDateInput.style.display = 'inline-block'; // Hide the input field
    }

    // Remove the date input field and replace it with a static text node
    const staticDate = document.createElement('span');
    staticDate.textContent = formattedEnglishDateSpan.textContent;
    englishDateInput.parentNode.replaceChild(staticDate, englishDateInput);
    staticDate.style.display = 'inline-block';
    staticDate.style.marginLeft = '5px';
    staticDate.style.outline = 'none';

    // Get "Forwards" input and create a span for wrapping
    const forwardsInput = document.querySelector('input[placeholder=""]');
    const forwardsSpan = document.createElement('span');

    // Set text content from the input and style the span for wrapping
    forwardsSpan.textContent = forwardsInput.textContent;
    forwardsSpan.style.whiteSpace = 'pre-wrap'; // Allow wrapping
    forwardsSpan.style.fontSize = forwardsInput.style.fontSize; // Match input style
    forwardsSpan.style.fontWeight = forwardsInput.style.fontWeight;
    forwardsInput.style.display = 'none';
    forwardsInput.parentElement.insertBefore(forwardsSpan, forwardsInput);

    // Cache elements to hide and their formatted spans
    const fieldsToHide = [
      {
        input: document.querySelector('input[placeholder=""]'),
        span: document.createElement('span'),
      },
      {
        input: document.querySelector(
          'input[placeholder="Enter Project Name"]'
        ),
        span: document.createElement('span'),
      },
      {
        input: document.querySelector('input[placeholder="Enter Plot No"]'),
        span: document.createElement('span'),
      },
      {
        input: document.querySelector('input[placeholder="Enter Area Name"]'),
        span: document.createElement('span'),
      },
    ];

    // Replace inputs with their values in spans
    fieldsToHide.forEach(({ input, span }) => {
      span.textContent = input.value;
      span.style.fontSize = input.style.fontSize; // Match the input style
      span.style.fontWeight = input.style.fontWeight;
      input.style.display = 'none';
      input.parentElement.insertBefore(span, input);
    });

    // Ensure all fields are updated
    formattedEnglishDateSpan.textContent = englishDateInput.value;
    formattedEnglishRefSpan.textContent = englishRefInput.value;
    formattedNameSpan.textContent = `${titleSelect.value} ${nameInput.value}`;
    formattedEnglishDateSpan.style.display = 'none';
    formattedEnglishRefSpan.style.display = 'inline';
    formattedEnglishRefSpan.style.position = 'relative';
    formattedEnglishRefSpan.style.top = '0px';
    formattedEnglishRefSpan.style.left = '-122px';
    formattedNameSpan.style.display = 'inline';

    amountText.style.display = 'inline';
    amountNumericDisplay.style.display = 'inline';
    amountInput.style.display = 'none';
    amountNumericDisplay.style.border = '1px solid rgba(0, 0, 0, 0.3)';
    amountNumericDisplay.style.padding = '1px 35px 4px 6px';
    amountNumericDisplay.style.borderRadius = '5px';

    // Hide input fields
    englishDateInput.style.display = 'inline-block';
    englishRefInput.style.display = 'none';
    nameInput.style.display = 'none';
    titleSelect.style.display = 'none';

    // Hide the buttons before generating the PDF
    const uploadingSignatureButton = document.getElementById(
      'uploading-signature'
    );
    const uploadSignatureButton = document.getElementById('upload-signature');
    const removeSignatureButton = document.getElementById('remove-signature');
    const underLine1 = document.getElementById('underline1');
    const underLine2 = document.getElementById('underline2');
    const receiptTitle = document.getElementById('receipt-title');
    const receiptSelect = document.getElementById('receipt-type');

    receiptSelect.style.display = 'none';
    uploadingSignatureButton.style.display = 'none';
    uploadSignatureButton.style.display = 'none';
    removeSignatureButton.style.display = 'none';
    underLine1.style.display = 'inline-block';
    underLine1.style.position = 'relative';
    underLine1.style.top = '7px';
    underLine1.style.left = '-85px';
    underLine2.style.display = 'inline-block';
    underLine2.style.position = 'relative';
    underLine2.style.top = '7px';
    underLine2.style.left = '6px';
    receiptTitle.style.border = 'solid 2px black';
    receiptTitle.style.padding = '3px 20px 7px 20px';
    receiptTitle.style.borderRadius = '6px';
    receiptTitle.style.textDecoration = 'underline';
    receiptTitle.style.textUnderlineOffset = '5px';
    receiptTitle.style.textDecorationThickness = '1.5px';
    receiptTitle.style.textAlign = 'center';
    receiptTypeSelect.style.display = 'none';

    const options = {
      margin: 0,
      filename: 'Payment Receipt.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    };

    html2pdf()
      .set(options)
      .from(receiptContainer)
      .save()
      .then(() => {
        // Restore visibility after PDF generation
        if (chequeCheckbox.checked) {
          formattedChequeSpan.remove();
          chequeInput.style.display = 'inline-block';
        }
        receiptTypeSelect.style.display = 'block';
        staticDate.parentNode.replaceChild(englishDateInput, staticDate);
        englishRefInput.style.display = 'inline-block';
        nameInput.style.display = 'inline-block';
        titleSelect.style.display = 'inline-block';
        amountInput.style.display = 'inline-block';
        amountNumericDisplay.style.display = 'none';
        uploadingSignatureButton.style.display = 'inline-block';
        uploadSignatureButton.style.display = 'inline-block';
        removeSignatureButton.style.display = 'inline-block';
        underLine1.style.display = 'inline-block';
        underLine1.style.position = 'relative';
        underLine1.style.top = '11px';
        underLine1.style.left = '-120px';
        underLine2.style.display = 'inline-block';
        underLine2.style.position = 'relative';
        underLine2.style.top = '11px';
        underLine2.style.left = '-120px';
        receiptTitle.style.border = 'solid 2px black';
        receiptTitle.style.padding = '3px 30px 7px 15px';
        receiptTitle.style.borderRadius = '6px';
        receiptTitle.style.textDecoration = 'underline';
        receiptTitle.style.textUnderlineOffset = '5px';
        receiptTitle.style.textDecorationThickness = '1.5px';
        receiptTitle.style.textAlign = 'center';
        receiptSelect.style.position = 'relative';
        receiptSelect.style.left = '220px';
        receiptSelect.style.top = '6px';

        formattedEnglishRefSpan.style.display = 'none';
        formattedNameSpan.style.display = 'none';
        amountText.style.display = 'inline';

        fieldsToHide.forEach(({ input, span }) => {
          span.remove();
          input.style.display = 'inline-block';
        });

        forwardsSpan.remove();
        forwardsInput.style.display = 'inline-block';
      });
  });
});

function onlyOne(checkbox) {
  var checkboxes = document.getElementsByName('option');
  checkboxes.forEach((item) => {
    if (item !== checkbox) item.checked = false;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Existing functionality...

  const uploadSignatureButton = document.getElementById('upload-signature');
  const signatureBox = document.querySelector('.signature-box');

  // Prebuilt e-sign image (can be a URL or base64 image)
  const prebuiltSignatureImage = 'assets/esignature.png'; // Replace with the actual image path or a base64 data URL.

  // Check if there's a signature in local storage on page load
  const savedSignature = localStorage.getItem('esignature');
  if (savedSignature) {
    signatureBox.style.backgroundImage = `url(${savedSignature})`;
    signatureBox.style.backgroundSize = 'contain';
    signatureBox.style.backgroundRepeat = 'no-repeat';
    signatureBox.style.backgroundPosition = 'center';
  }

  uploadSignatureButton.addEventListener('click', () => {
    // Display the prebuilt signature image
    signatureBox.style.backgroundImage = `url(${prebuiltSignatureImage})`;
    signatureBox.style.backgroundSize = 'contain';
    signatureBox.style.backgroundRepeat = 'no-repeat';
    signatureBox.style.backgroundPosition = 'center';

    // Save the image URL to local storage
    localStorage.setItem('esignature', prebuiltSignatureImage);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const uploadSignatureButton = document.getElementById('upload-signature');
  const removeSignatureButton = document.getElementById('remove-signature');
  const signatureBox = document.querySelector('.signature-box');

  // Prebuilt e-sign image path
  const prebuiltSignatureImage = 'assets/esignature.png';

  // Load saved signature from local storage
  const savedSignature = localStorage.getItem('esignature');
  if (savedSignature) {
    signatureBox.style.backgroundImage = `url(${savedSignature})`;
    signatureBox.style.backgroundSize = 'contain';
    signatureBox.style.backgroundRepeat = 'no-repeat';
    signatureBox.style.backgroundPosition = 'center';
  }

  // Handle the "Use Prebuilt E-sign" button
  uploadSignatureButton.addEventListener('click', () => {
    signatureBox.style.backgroundImage = `url(${prebuiltSignatureImage})`;
    signatureBox.style.backgroundSize = 'contain';
    signatureBox.style.backgroundRepeat = 'no-repeat';
    signatureBox.style.backgroundPosition = 'center';

    // Save to local storage
    localStorage.setItem('esignature', prebuiltSignatureImage);
  });

  // Handle the "Remove E-sign" button
  removeSignatureButton.addEventListener('click', () => {
    // Clear the signature box
    signatureBox.style.backgroundImage = '';
    signatureBox.style.backgroundSize = '';
    signatureBox.style.backgroundRepeat = '';
    signatureBox.style.backgroundPosition = '';

    // Remove from local storage
    localStorage.removeItem('esignature');
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const englishDateInput = document.getElementById('english-date');

  // Set the current date in "YYYY-MM-DD" format
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split('T')[0];
  englishDateInput.value = formattedDate;

  // Optionally update Arabic and formatted English date spans
  const formatEnglishDate = (date) =>
    `${String(date.getDate()).padStart(2, '0')}/${String(
      date.getMonth() + 1
    ).padStart(2, '0')}/${date.getFullYear()}`;

  document.getElementById('formatted-english-date').textContent =
    formatEnglishDate(currentDate);
});

document.addEventListener('DOMContentLoaded', () => {
  const receiptTypeSelect = document.getElementById('receipt-type');
  const receiptTitle = document.getElementById('receipt-title');

  // Update the title based on the selected option
  receiptTypeSelect.addEventListener('change', () => {
    receiptTitle.textContent = receiptTypeSelect.value;
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const verificationContainer = document.getElementById(
    'verification-container'
  );
  const uploadContainer = document.getElementById('upload-container');
  const signaturePasscodeInput = document.getElementById('signature-passcode');
  const verifyButton = document.getElementById('verify-passcode');
  const uploadSignatureButton = document.getElementById('upload-signature');
  const signatureBox = document.querySelector('.signature-box');
  const prebuiltSignatureImage = 'assets/esignature.png'; // Replace with actual prebuilt signature path
  const correctPasscode = '1988'; // Example passcode; replace with a secure method.

  // Initially hide the upload container
  uploadContainer.style.display = 'none';

  // Verify the passcode
  verifyButton.addEventListener('click', () => {
    const enteredPasscode = signaturePasscodeInput.value;

    if (enteredPasscode === correctPasscode) {
      // Show the upload controls
      uploadContainer.style.display = 'flex';
      verificationContainer.style.display = 'none'; // Hide the passcode input
    } else {
      alert('Invalid passcode. Please try again.');
    }
  });

  // Upload the prebuilt signature
  uploadSignatureButton.addEventListener('click', () => {
    signatureBox.style.backgroundImage = `url(${prebuiltSignatureImage})`;
    signatureBox.style.backgroundSize = 'contain';
    signatureBox.style.backgroundRepeat = 'no-repeat';
    signatureBox.style.backgroundPosition = 'center';
  });

  // Reset controls on page reload
  window.addEventListener('load', () => {
    signaturePasscodeInput.value = '';
    uploadContainer.style.display = 'none';
    verificationContainer.style.display = 'flex';
    signatureBox.style.backgroundImage = ''; // Clear the signature
  });
});
