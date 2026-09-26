/**
 * Dr. Ahmed Ramadan Silem Dental Clinic
 * Interactive JavaScript Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Navigation Drawer (Initialized immediately & resiliently)
  const mobileToggle = document.getElementById('mobileNavToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const drawerClose = document.getElementById('drawerClose');

  function openDrawer(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (mobileDrawer) {
      mobileDrawer.classList.add('open');
      mobileDrawer.setAttribute('aria-hidden', 'false');
    }
    if (drawerOverlay) drawerOverlay.classList.add('active');
    if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (mobileDrawer) {
      mobileDrawer.classList.remove('open');
      mobileDrawer.setAttribute('aria-hidden', 'true');
    }
    if (drawerOverlay) drawerOverlay.classList.remove('active');
    if (mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (mobileToggle) {
    mobileToggle.addEventListener('click', openDrawer);
    mobileToggle.addEventListener('touchend', (e) => {
      openDrawer(e);
    });
  }
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  document.querySelectorAll('.drawer-links a').forEach(a => {
    a.addEventListener('click', () => {
      closeDrawer();
    });
  });

  // Close drawer on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024 && mobileDrawer && mobileDrawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  // Sticky Header Scroll Effect
  const siteHeader = document.getElementById('siteHeader');
  if (siteHeader) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // 2. State Management
  let currentLang = localStorage.getItem('silem_lang') || 'ar';
  let currentSlide = 0;
  let slideInterval = null;
  let currentStep = 1;
  
  // Booking Data
  const bookingData = {
    serviceName: 'كشف عام واستشارة طبية شاملة',
    servicePrice: '200 ج.م',
    date: '',
    timeSlot: '',
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    patientAge: '',
    patientNotes: '',
    paymentMethod: 'vodafone',
    vodaSender: '',
    vodaRef: '',
    bookingId: ''
  };

  // 3. Language Translation Engine
  const langToggleBtn = document.getElementById('langToggleBtn');
  
  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('silem_lang', lang);
    const htmlEl = document.documentElement;
    
    if (lang === 'ar') {
      htmlEl.setAttribute('dir', 'rtl');
      htmlEl.setAttribute('lang', 'ar');
      if (langToggleBtn) langToggleBtn.innerHTML = `
        <svg viewBox="0 0 24 24"><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>
        <span>English</span>
      `;
    } else {
      htmlEl.setAttribute('dir', 'ltr');
      htmlEl.setAttribute('lang', 'en');
      if (langToggleBtn) langToggleBtn.innerHTML = `
        <svg viewBox="0 0 24 24"><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>
        <span>العربية</span>
      `;
    }

    // Translate all elements with data-i18n
    const dict = (typeof translations !== 'undefined' && translations[lang]) ? translations[lang] : ((typeof translations !== 'undefined' && translations.ar) ? translations.ar : {});
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    // Translate placeholders
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      if (dict[key]) {
        el.setAttribute('placeholder', dict[key]);
      }
    });

    // Re-generate time slots to reflect language if on booking page
    if (typeof generateTimeSlots === 'function' && document.getElementById('slotsContainer')) {
      generateTimeSlots();
    }

    // Update Hero Video Audio UI with active language
    if (typeof updateVideoAudioUI === 'function') {
      updateVideoAudioUI();
    }
  }

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      applyLanguage(currentLang === 'ar' ? 'en' : 'ar');
    });
  }

  // 4. Hero Video Player & Audio Controls (Default: Muted)
  const heroVideo = document.getElementById('heroVideo');
  const videoSoundToggle = document.getElementById('videoSoundToggle');
  const soundIconWrap = document.getElementById('soundIconWrap');
  const soundText = document.getElementById('soundText');

  const muteSvg = `<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;
  const soundSvg = `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;

  function updateVideoAudioUI() {
    if (!videoSoundToggle || !heroVideo) return;
    const dict = (typeof translations !== 'undefined' && translations[currentLang]) ? translations[currentLang] : ((typeof translations !== 'undefined' && translations.ar) ? translations.ar : {});
    if (heroVideo.muted) {
      videoSoundToggle.classList.remove('unmuted');
      if (soundIconWrap) soundIconWrap.innerHTML = muteSvg;
      if (soundText) soundText.textContent = dict.videoEnableSound || 'تشغيل الصوت';
      videoSoundToggle.setAttribute('aria-label', dict.videoEnableSound || 'تشغيل الصوت');
    } else {
      videoSoundToggle.classList.add('unmuted');
      if (soundIconWrap) soundIconWrap.innerHTML = soundSvg;
      if (soundText) soundText.textContent = dict.videoMuteSound || 'كتم الصوت';
      videoSoundToggle.setAttribute('aria-label', dict.videoMuteSound || 'كتم الصوت');
    }
  }

  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.volume = 1.0;
    heroVideo.play().catch(() => {
      document.addEventListener('click', () => {
        if (heroVideo.paused) heroVideo.play();
      }, { once: true });
    });

    if (videoSoundToggle) {
      videoSoundToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        heroVideo.muted = !heroVideo.muted;
        if (!heroVideo.muted) {
          heroVideo.volume = 1.0;
          if (heroVideo.paused) heroVideo.play();
        }
        updateVideoAudioUI();
      });
    }

    updateVideoAudioUI();
  }

  // Initial language setup
  applyLanguage(currentLang);

  // 5. Interactive Direct Booking System (No Login)
  const serviceItems = document.querySelectorAll('.booking-service-item');
  const dateInput = document.getElementById('bookingDate');
  const slotsContainer = document.getElementById('slotsContainer');
  const stepIndicators = document.querySelectorAll('.step-indicator');
  const stepContents = document.querySelectorAll('.booking-step-content');
  const btnNextStep = document.getElementById('btnNextStep');
  const btnPrevStep = document.getElementById('btnPrevStep');
  const paymentTabs = document.querySelectorAll('.payment-tab');
  const paymentTabContents = document.querySelectorAll('.payment-tab-content');

  // Step 1: Select Service
  serviceItems.forEach(item => {
    item.addEventListener('click', () => {
      serviceItems.forEach(i => i.classList.remove('selected'));
      item.classList.add('selected');
      bookingData.serviceName = item.dataset.service || item.querySelector('h5').innerText;
      bookingData.servicePrice = item.dataset.price || '200 ج.م';
    });
  });

  // Also bind "Book This Treatment" in services section to preselect & scroll
  document.querySelectorAll('.service-book-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const srvId = btn.dataset.serviceTarget;
      const targetCard = document.querySelector(`.booking-service-item[data-service-id="${srvId}"]`);
      if (targetCard) {
        targetCard.click();
      }
      const bookingSec = document.getElementById('booking');
      if (bookingSec) {
        bookingSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Step 2: Date Setup & Validation (Clinic closed on Fridays)
  const today = new Date();
  // Default to tomorrow or next work day
  let defaultDate = new Date();
  defaultDate.setDate(today.getDate() + 1);
  if (defaultDate.getDay() === 5) { // Friday
    defaultDate.setDate(defaultDate.getDate() + 1);
  }
  
  if (dateInput) {
    const yyyy = defaultDate.getFullYear();
    const mm = String(defaultDate.getMonth() + 1).padStart(2, '0');
    const dd = String(defaultDate.getDate()).padStart(2, '0');
    dateInput.value = `${yyyy}-${mm}-${dd}`;
    bookingData.date = dateInput.value;

    // Minimum date is today
    const minDd = String(today.getDate()).padStart(2, '0');
    const minMm = String(today.getMonth() + 1).padStart(2, '0');
    dateInput.min = `${today.getFullYear()}-${minMm}-${minDd}`;

    dateInput.addEventListener('change', () => {
      const selDate = new Date(dateInput.value);
      if (selDate.getDay() === 5) { // Friday is clinic off-day
        showToast(currentLang === 'ar' ? 'العيادة عطلة يوم الجمعة، يرجى اختيار يوم آخر' : 'The clinic is closed on Fridays, please choose another day');
        dateInput.value = '';
        bookingData.date = '';
        if (slotsContainer) slotsContainer.innerHTML = '';
        return;
      }
      bookingData.date = dateInput.value;
      generateTimeSlots();
    });
  }

  // Clinic working hours slots (1:00 PM to 9:30 PM)
  const clinicSlots = [
    { ar: '01:00 ظهراً', en: '01:00 PM', booked: false },
    { ar: '02:00 ظهراً', en: '02:00 PM', booked: false },
    { ar: '03:00 عصراً', en: '03:00 PM', booked: true },
    { ar: '04:00 عصراً', en: '04:00 PM', booked: false },
    { ar: '05:00 مساءً', en: '05:00 PM', booked: false },
    { ar: '06:00 مساءً', en: '06:00 PM', booked: false },
    { ar: '07:00 مساءً', en: '07:00 PM', booked: true },
    { ar: '08:00 مساءً', en: '08:00 PM', booked: false },
    { ar: '08:45 مساءً', en: '08:45 PM', booked: false },
    { ar: '09:30 مساءً', en: '09:30 PM', booked: false }
  ];

  function generateTimeSlots() {
    const container = document.getElementById('slotsContainer');
    if (!container) return;
    container.innerHTML = '';
    clinicSlots.forEach(slot => {
      const slotEl = document.createElement('div');
      slotEl.className = `time-slot ${slot.booked ? 'booked' : ''}`;
      const text = currentLang === 'ar' ? slot.ar : slot.en;
      slotEl.innerText = text;
      
      if (!slot.booked) {
        slotEl.addEventListener('click', () => {
          document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
          slotEl.classList.add('selected');
          bookingData.timeSlot = text;
        });
      }
      container.appendChild(slotEl);
    });
  }

  generateTimeSlots();

  // Wizard Step Switching
  function updateWizardSteps() {
    stepIndicators.forEach((ind, i) => {
      const stepNum = i + 1;
      ind.classList.remove('active', 'completed');
      if (stepNum === currentStep) {
        ind.classList.add('active');
      } else if (stepNum < currentStep) {
        ind.classList.add('completed');
      }
    });

    stepContents.forEach((sc, i) => {
      sc.classList.toggle('active', i + 1 === currentStep);
    });

    if (btnPrevStep) {
      btnPrevStep.style.display = currentStep === 1 ? 'none' : 'inline-flex';
    }

    if (btnNextStep) {
      const dict = translations[currentLang] || translations.ar;
      if (currentStep === 4) {
        btnNextStep.textContent = dict.confirmBooking || 'تأكيد الحجز النهائي';
      } else {
        btnNextStep.textContent = dict.nextStep || 'التالي';
      }
    }
  }

  if (btnNextStep) {
    btnNextStep.addEventListener('click', () => {
      // Validate Step 1
      if (currentStep === 1) {
        const selSrv = document.querySelector('.booking-service-item.selected');
        if (!selSrv) {
          showToast(currentLang === 'ar' ? 'يرجى اختيار الخدمة الطبية المطلوبة أولاً' : 'Please select a dental service first');
          return;
        }
      }

      // Validate Step 2
      if (currentStep === 2) {
        if (!bookingData.date) {
          showToast(currentLang === 'ar' ? 'يرجى تحديد تاريخ الموعد' : 'Please choose an appointment date');
          return;
        }
        if (!bookingData.timeSlot) {
          showToast(currentLang === 'ar' ? 'يرجى اختيار التوقيت المناسب من القائمة' : 'Please select a suitable time slot');
          return;
        }
      }

      // Validate Step 3
      if (currentStep === 3) {
        const nameVal = document.getElementById('bPatientName')?.value.trim();
        const phoneVal = document.getElementById('bPatientPhone')?.value.trim();
        if (!nameVal || nameVal.length < 3) {
          showToast(currentLang === 'ar' ? 'يرجى إدخال اسم المريض كاملاً' : 'Please enter patient full name');
          return;
        }
        if (!phoneVal || phoneVal.length < 10) {
          showToast(currentLang === 'ar' ? 'يرجى إدخال رقم هاتف صحيح للتواصل' : 'Please enter a valid phone number');
          return;
        }
        bookingData.patientName = nameVal;
        bookingData.patientPhone = phoneVal;
        bookingData.patientEmail = document.getElementById('bPatientEmail')?.value.trim() || '';
        bookingData.patientAge = document.getElementById('bPatientAge')?.value.trim() || '';
        bookingData.patientNotes = document.getElementById('bPatientNotes')?.value.trim() || '';
      }

      // If at step 4, Submit final booking!
      if (currentStep === 4) {
        completeBooking();
        return;
      }

      currentStep++;
      updateWizardSteps();
    });
  }

  if (btnPrevStep) {
    btnPrevStep.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        updateWizardSteps();
      }
    });
  }

  // Payment Tabs Selector
  paymentTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      paymentTabs.forEach(t => t.classList.remove('active'));
      paymentTabContents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      bookingData.paymentMethod = tab.dataset.payment;
      const targetContent = document.getElementById(`payContent_${tab.dataset.payment}`);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  // Final Confirmation & Ticket Generation
  const ticketModal = document.getElementById('ticketModal');
  const btnCloseTicket = document.getElementById('btnCloseTicket');
  const btnSendTicketWa = document.getElementById('btnSendTicketWa');
  const btnAddToCalendar = document.getElementById('btnAddToCalendar');
  const btnPrintTicket = document.getElementById('btnPrintTicket');

  function completeBooking() {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    bookingData.bookingId = `SLM-${randomId}`;

    if (bookingData.paymentMethod === 'vodafone') {
      bookingData.vodaSender = document.getElementById('vodaSenderInput')?.value.trim() || '';
      bookingData.vodaRef = document.getElementById('vodaRefInput')?.value.trim() || '';
    }

    // Populate ticket modal
    document.getElementById('ticketCodeDisplay').textContent = bookingData.bookingId;
    document.getElementById('ticketPatientDisplay').textContent = bookingData.patientName;
    document.getElementById('ticketServiceDisplay').textContent = `${bookingData.serviceName} (${bookingData.servicePrice})`;
    document.getElementById('ticketDateTimeDisplay').textContent = `${bookingData.date} | ${bookingData.timeSlot}`;
    
    let payText = '';
    if (bookingData.paymentMethod === 'vodafone') {
      payText = currentLang === 'ar' ? `فودافون كاش (محفظة: ${bookingData.vodaSender || 'قيد التحويل'})` : `Vodafone Cash (${bookingData.vodaSender || 'Pending'})`;
    } else if (bookingData.paymentMethod === 'paymob') {
      payText = currentLang === 'ar' ? 'باي موب (تم الدفع الإلكتروني)' : 'Paymob (Online Card Paid)';
    } else {
      payText = currentLang === 'ar' ? 'الدفع عند الحضور بالعيادة' : 'Pay at Clinic on Arrival';
    }
    document.getElementById('ticketPaymentDisplay').textContent = payText;

    // Show ticket modal
    if (ticketModal) ticketModal.classList.add('active');
  }

  if (btnCloseTicket) {
    btnCloseTicket.addEventListener('click', () => {
      if (ticketModal) ticketModal.classList.remove('active');
      // Reset wizard
      currentStep = 1;
      updateWizardSteps();
    });
  }

  // Send Ticket via WhatsApp to Dr. Silem: 01024677199
  if (btnSendTicketWa) {
    btnSendTicketWa.addEventListener('click', () => {
      const msg = `مرحباً د. أحمد سليم، أود تأكيد موعد كشف في عيادتكم:\n\n` +
        `رقم الحجز: ${bookingData.bookingId}\n` +
        `اسم المريض: ${bookingData.patientName}\n` +
        `الخدمة: ${bookingData.serviceName}\n` +
        `التاريخ: ${bookingData.date}\n` +
        `التوقيت: ${bookingData.timeSlot}\n` +
        `طريقة الدفع: ${bookingData.paymentMethod}\n\n` +
        `شكراً دكتور أحمد.`;
      const waUrl = `https://wa.me/201024677199?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank');
    });
  }

  // Add to Google Calendar
  if (btnAddToCalendar) {
    btnAddToCalendar.addEventListener('click', () => {
      const title = `موعد أسنان - عيادة د. أحمد سليم (${bookingData.serviceName})`;
      const details = `موعد حجز لدى عيادة د. أحمد رمضان سليم بالفيوم. كود الحجز: ${bookingData.bookingId} - هاتف: 01024677199`;
      const location = `السواقي بجوار مطعم حسن أرابيسك، الفيوم، مصر`;
      
      const cleanDate = bookingData.date.replace(/-/g, '');
      const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${cleanDate}T130000Z/${cleanDate}T140000Z&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
      window.open(gcalUrl, '_blank');
    });
  }

  // Print Ticket
  if (btnPrintTicket) {
    btnPrintTicket.addEventListener('click', () => {
      window.print();
    });
  }

  // 6. Online Consultation Form Submission
  const consultForm = document.getElementById('consultForm');
  const urgencyOptions = document.querySelectorAll('.urgency-option');
  let selectedUrgency = 'خفيف';

  urgencyOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      urgencyOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      selectedUrgency = opt.dataset.urgency;
    });
  });

  if (consultForm) {
    consultForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('consultNameInput')?.value.trim();
      const phone = document.getElementById('consultPhoneInput')?.value.trim();
      const issue = document.getElementById('consultIssueSelect')?.value;
      const details = document.getElementById('consultDetailsInput')?.value.trim();
      const preferred = document.querySelector('input[name="consultPref"]:checked')?.value || 'واتساب';

      if (!name || !phone) {
        showToast(currentLang === 'ar' ? 'يرجى كتابة الاسم ورقم الهاتف' : 'Please provide name and phone number');
        return;
      }

      // Generate WhatsApp Direct Triage message
      const consultMsg = `استشارة أونلاين جديدة - عيادة د. أحمد سليم:\n\n` +
        `اسم المريض: ${name}\n` +
        `رقم الهاتف: ${phone}\n` +
        `الشكوى: ${issue}\n` +
        `درجة الألم: ${selectedUrgency}\n` +
        `التفاصيل: ${details || 'لا توجد تفاصيل إضافية'}\n` +
        `التواصل المفضل: ${preferred}`;

      const waUrl = `https://wa.me/201024677199?text=${encodeURIComponent(consultMsg)}`;
      showToast(currentLang === 'ar' ? 'جاري تحويلك إلى واتساب الطبيب للمعاينة...' : 'Redirecting to Doctor WhatsApp for review...');
      setTimeout(() => {
        window.open(waUrl, '_blank');
        consultForm.reset();
      }, 1200);
    });
  }

  // 7. Interactive Before & After Comparison Slider
  const baContainer = document.getElementById('baContainer');
  const baBefore = document.getElementById('baBefore');
  const baHandle = document.getElementById('baHandle');
  let isDraggingBa = false;

  function setSliderPosition(x) {
    if (!baContainer || !baBefore || !baHandle) return;
    const rect = baContainer.getBoundingClientRect();
    let pos = (x - rect.left) / rect.width;
    if (pos < 0.05) pos = 0.05;
    if (pos > 0.95) pos = 0.95;
    const percent = pos * 100;
    
    // In RTL vs LTR
    const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
    if (isRtl) {
      baBefore.style.width = `${100 - percent}%`;
      baHandle.style.left = `${percent}%`;
    } else {
      baBefore.style.width = `${percent}%`;
      baHandle.style.left = `${percent}%`;
    }
  }

  function updateSliderImgWidth() {
    if (baContainer && baBefore) {
      const img = baBefore.querySelector('img');
      if (img) {
        img.style.width = `${baContainer.offsetWidth}px`;
        img.style.maxWidth = 'none';
      }
    }
  }
  window.addEventListener('resize', updateSliderImgWidth);
  setTimeout(updateSliderImgWidth, 200);

  if (baContainer && baHandle) {
    baContainer.addEventListener('mousedown', (e) => {
      isDraggingBa = true;
      setSliderPosition(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDraggingBa) return;
      setSliderPosition(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      isDraggingBa = false;
    });

    // Touch support
    baContainer.addEventListener('touchstart', (e) => {
      isDraggingBa = true;
      setSliderPosition(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDraggingBa) return;
      setSliderPosition(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDraggingBa = false;
    });
  }

  // 8. Gallery Filters
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;

      galleryItems.forEach(item => {
        const itemCats = (item.dataset.category || '').split(/\s+/);
        if (cat === 'all' || itemCats.includes(cat)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // 8.1. Our Clinical Cases Filters
  const caseFilterBtns = document.querySelectorAll('.case-filter-btn');
  const caseCards = document.querySelectorAll('.case-card');

  caseFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      caseFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.caseFilter;

      caseCards.forEach(card => {
        const itemCats = (card.dataset.caseCat || '').split(/\s+/);
        if (cat === 'all' || itemCats.includes(cat)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 9. Quick Copy Utility (Vodafone Cash number)
  window.copyVodafoneNumber = function() {
    const num = '01024677199';
    navigator.clipboard.writeText(num).then(() => {
      showToast(currentLang === 'ar' ? 'تم نسخ رقم فودافون كاش: 01024677199' : 'Copied Vodafone Cash number: 01024677199');
    }).catch(() => {
      showToast('01024677199');
    });
  };

  // 10. Toast Notification Helper
  const toastEl = document.getElementById('toastMsg');
  let toastTimer = null;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 3500);
  }

  // 11. Contact Form Handler
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast(currentLang === 'ar' ? 'تم استلام رسالتك بنجاح، سنرد عليك في أقرب وقت' : 'Your message has been received, we will reply shortly');
      contactForm.reset();
    });
  }

});
