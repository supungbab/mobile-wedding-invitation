/* ============================================
   Mobile Wedding Invitation - Main JS
   Based on toourguest.com reference
   ============================================ */
(function () {
  'use strict';

  /* ---------- Config ---------- */
  var WEDDING_DATE = new Date('2027-02-20T15:30:00+09:00');
  var WEDDING_YEAR = 2027;
  var WEDDING_MONTH = 2; // February (1-indexed)
  var WEDDING_DAY = 20;

  /* ========== Scroll Animator ========== */
  var ScrollAnimator = {
    init: function () {
      var els = document.querySelectorAll('.gsap-text');
      if (!('IntersectionObserver' in window)) {
        els.forEach(function (el) { el.classList.add('visible'); });
        return;
      }
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      els.forEach(function (el) { observer.observe(el); });
    }
  };

  /* ========== Calendar ========== */
  var Calendar = {
    init: function () {
      this.renderGrid();
      this.startCountdown();
    },
    renderGrid: function () {
      var grid = document.getElementById('calendarGrid');
      if (!grid) return;

      var days = ['일', '월', '화', '수', '목', '금', '토'];
      days.forEach(function (d, i) {
        var el = document.createElement('div');
        el.className = 'cal-header';
        if (i === 0) el.style.color = '#E57373';
        el.textContent = d;
        grid.appendChild(el);
      });

      // February 2027
      var firstDay = new Date(WEDDING_YEAR, WEDDING_MONTH - 1, 1).getDay();
      var daysInMonth = new Date(WEDDING_YEAR, WEDDING_MONTH, 0).getDate();

      for (var i = 0; i < firstDay; i++) {
        var empty = document.createElement('div');
        empty.className = 'cal-day cal-day--empty';
        grid.appendChild(empty);
      }

      for (var d = 1; d <= daysInMonth; d++) {
        var dayEl = document.createElement('div');
        dayEl.className = 'cal-day';
        var dayOfWeek = (firstDay + d - 1) % 7;
        if (dayOfWeek === 0) dayEl.classList.add('cal-day--sun');
        if (d === WEDDING_DAY) {
          dayEl.classList.add('cal-day--wedding');
        }
        dayEl.textContent = d;
        grid.appendChild(dayEl);
      }
    },
    startCountdown: function () {
      var self = this;
      self.updateCountdown();
      setInterval(function () { self.updateCountdown(); }, 1000);
    },
    updateCountdown: function () {
      var now = new Date();
      var diff = WEDDING_DATE - now;

      if (diff <= 0) {
        document.getElementById('countDays').textContent = '0';
        document.getElementById('countHours').textContent = '0';
        document.getElementById('countMinutes').textContent = '0';
        document.getElementById('countSeconds').textContent = '0';
        document.getElementById('ddayCount').textContent = '0';
        return;
      }

      var days = Math.floor(diff / (1000 * 60 * 60 * 24));
      var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((diff % (1000 * 60)) / 1000);

      document.getElementById('countDays').textContent = days;
      document.getElementById('countHours').textContent = hours;
      document.getElementById('countMinutes').textContent = minutes;
      document.getElementById('countSeconds').textContent = seconds;

      var ddayCount = document.getElementById('ddayCount');
      if (ddayCount) ddayCount.textContent = days;
    }
  };

  /* ========== Accordion ========== */
  var Accordion = {
    init: function () {
      var headers = document.querySelectorAll('.accordion__header');
      headers.forEach(function (header) {
        header.addEventListener('click', function () {
          var parent = this.closest('.accordion');
          var isOpen = parent.classList.contains('open');

          // Close all
          document.querySelectorAll('.accordion.open').forEach(function (a) {
            a.classList.remove('open');
          });

          // Toggle current
          if (!isOpen) {
            parent.classList.add('open');
          }
        });
      });
    }
  };

  /* ========== Gallery ========== */
  var Gallery = {
    images: [],
    currentIndex: 0,
    init: function () {
      var self = this;
      var items = document.querySelectorAll('.gallery__item');
      items.forEach(function (item) {
        var img = item.querySelector('img');
        self.images.push(img.src);
        item.addEventListener('click', function () {
          var idx = parseInt(item.getAttribute('data-index'));
          self.openLightbox(idx);
        });
      });

      // More button
      var moreBtn = document.getElementById('galleryMoreBtn');
      var grid = document.getElementById('galleryGrid');
      if (moreBtn && grid) {
        moreBtn.addEventListener('click', function () {
          grid.classList.add('expanded');
          moreBtn.classList.add('hidden');
        });
      }

      // Lightbox controls
      document.getElementById('lightboxClose').addEventListener('click', function () { self.closeLightbox(); });
      document.getElementById('lightboxPrev').addEventListener('click', function () { self.prevImage(); });
      document.getElementById('lightboxNext').addEventListener('click', function () { self.nextImage(); });

      // Keyboard
      document.addEventListener('keydown', function (e) {
        var lb = document.getElementById('lightbox');
        if (!lb.classList.contains('active')) return;
        if (e.key === 'Escape') self.closeLightbox();
        if (e.key === 'ArrowLeft') self.prevImage();
        if (e.key === 'ArrowRight') self.nextImage();
      });

      // Touch swipe
      var startX = 0;
      var lb = document.getElementById('lightbox');
      lb.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
      }, { passive: true });
      lb.addEventListener('touchend', function (e) {
        var endX = e.changedTouches[0].clientX;
        var diff = startX - endX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) self.nextImage();
          else self.prevImage();
        }
      });
    },
    openLightbox: function (idx) {
      this.currentIndex = idx;
      this.showImage();
      document.getElementById('lightbox').classList.add('active');
      document.body.style.overflow = 'hidden';
    },
    closeLightbox: function () {
      document.getElementById('lightbox').classList.remove('active');
      document.body.style.overflow = '';
    },
    showImage: function () {
      document.getElementById('lightboxImg').src = this.images[this.currentIndex];
      document.getElementById('lightboxCounter').textContent = (this.currentIndex + 1) + ' / ' + this.images.length;
    },
    prevImage: function () {
      this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
      this.showImage();
    },
    nextImage: function () {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
      this.showImage();
    }
  };

  /* ========== Contact Modal ========== */
  var ContactModal = {
    init: function () {
      var self = this;
      var btn = document.getElementById('contactBtn');
      var modal = document.getElementById('contactModal');
      var close = document.getElementById('contactModalClose');
      var backdrop = document.getElementById('contactBackdrop');

      if (btn) btn.addEventListener('click', function () { self.open(); });
      if (close) close.addEventListener('click', function () { self.close(); });
      if (backdrop) backdrop.addEventListener('click', function () { self.close(); });
    },
    open: function () {
      document.getElementById('contactModal').classList.add('active');
      document.body.style.overflow = 'hidden';
    },
    close: function () {
      document.getElementById('contactModal').classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  /* ========== Clipboard ========== */
  var Clipboard = {
    init: function () {
      var btns = document.querySelectorAll('.copy-btn');
      btns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var text = this.getAttribute('data-copy');
          navigator.clipboard.writeText(text).then(function () {
            Toast.show('계좌번호가 복사되었습니다');
          }).catch(function () {
            Toast.show('복사에 실패했습니다');
          });
        });
      });
    }
  };

  /* ========== Share ========== */
  var Share = {
    init: function () {
      var copyBtn = document.getElementById('copyLinkBtn');
      if (copyBtn) {
        copyBtn.addEventListener('click', function () {
          navigator.clipboard.writeText(window.location.href).then(function () {
            Toast.show('청첩장 주소가 복사되었습니다');
          }).catch(function () {
            Toast.show('복사에 실패했습니다');
          });
        });
      }

      var kakaoBtn = document.getElementById('kakaoShareBtn');
      if (kakaoBtn) {
        kakaoBtn.addEventListener('click', function () {
          Toast.show('카카오톡 공유 기능은 준비 중입니다');
        });
      }
    }
  };

  /* ========== BGM Player ========== */
  var BGMPlayer = {
    audio: null,
    isPlaying: false,
    init: function () {
      var self = this;
      var btn = document.getElementById('bgmBtn');
      if (!btn) return;

      btn.addEventListener('click', function () {
        self.toggle();
      });
    },
    toggle: function () {
      var bars = document.querySelector('.bgm-icon--bars');
      var muted = document.querySelector('.bgm-icon--muted');

      if (this.isPlaying) {
        if (this.audio) this.audio.pause();
        this.isPlaying = false;
        bars.style.display = 'none';
        muted.style.display = 'block';
      } else {
        if (!this.audio) {
          this.audio = new Audio();
          this.audio.loop = true;
        }
        this.audio.play().catch(function () {});
        this.isPlaying = true;
        bars.style.display = 'block';
        muted.style.display = 'none';
      }
    }
  };

  /* ========== Toast ========== */
  var Toast = {
    timer: null,
    show: function (msg) {
      var el = document.getElementById('toast');
      if (!el) return;
      el.textContent = msg;
      el.classList.add('show');
      clearTimeout(this.timer);
      this.timer = setTimeout(function () {
        el.classList.remove('show');
      }, 2500);
    }
  };

  /* ========== Init ========== */
  document.addEventListener('DOMContentLoaded', function () {
    ScrollAnimator.init();
    Calendar.init();
    Accordion.init();
    Gallery.init();
    ContactModal.init();
    Clipboard.init();
    Share.init();
    BGMPlayer.init();
  });

})();
