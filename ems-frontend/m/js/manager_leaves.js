document.addEventListener('DOMContentLoaded', () => {
  const leavesGrid = document.getElementById('leavesGrid');
  const pendingCount = document.getElementById('pendingCount');
  const approvedCount = document.getElementById('approvedCount');
  const onLeaveCount = document.getElementById('onLeaveCount');
  const upcomingCount = document.getElementById('upcomingCount');
  const loadingState = document.getElementById('loadingState');
  const errorState = document.getElementById('errorState');

  // Modal Elements
  const leaveActionModal = document.getElementById('leaveActionModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalComment = document.getElementById('modalComment');
  const modalCancelBtn = document.getElementById('modalCancelBtn');
  const modalConfirmBtn = document.getElementById('modalConfirmBtn');

  let selectedLeaveId = null;
  let selectedAction = null;

  async function fetchLeaves() {
    try {
      loadingState.classList.remove('hidden');
      const res = await fetch('/api/leaves'); // Adjust path if needed
      if (!res.ok) throw new Error('Failed to fetch leaves');

      const leaves = await res.json();
      loadingState.classList.add('hidden');
      renderLeaves(leaves);
      updateCounts(leaves);
    } catch (err) {
      console.error(err);
      loadingState.classList.add('hidden');
      errorState.classList.remove('hidden');
    }
  }

  function renderLeaves(leaves) {
    leavesGrid.innerHTML = '';

    if (!leaves.length) {
      leavesGrid.innerHTML = `<p class="text-gray-600 col-span-full text-center">No leave requests found.</p>`;
      return;
    }

    leaves.forEach((leave) => {
      const card = document.createElement('div');
      card.className = 'bg-white rounded-xl shadow-md p-5 space-y-2';

      const statusColor = {
        pending: 'text-yellow-600',
        approved: 'text-green-600',
        rejected: 'text-red-600'
      };

      let statusText = 'Pending';
      if (leave.status === 'approved' || leave.status === 1 || leave.status === '1') statusText = 'Approved';
      if (leave.status === 'rejected' || leave.status === 2 || leave.status === '2') statusText = 'Rejected';

      card.innerHTML = `
        <h4 class="text-lg font-semibold text-gray-800">${leave.employee_name || 'Unknown Employee'}</h4>
        <p><strong>Type:</strong> ${leave.leave_type_name || 'N/A'}</p>
        <p><strong>From:</strong> ${formatDate(leave.start_date)}</p>
        <p><strong>To:</strong> ${formatDate(leave.end_date)}</p>
        <p><strong>Status:</strong> <span class="${statusColor[statusText.toLowerCase()] || 'text-gray-600'}">${statusText}</span></p>
        <p><strong>Reason:</strong> ${leave.reason}</p>
        <div class="flex gap-3 pt-2">
          ${leave.status === 'pending' || leave.status === 0 || leave.status === '0' ? `
            <button class="approve-btn bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded" data-id="${leave.id}">Approve</button>
            <button class="reject-btn bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded" data-id="${leave.id}">Reject</button>
          ` : ''}
        </div>
      `;
      leavesGrid.appendChild(card);
    });

    setupActionButtons();
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function updateCounts(leaves) {
    let pending = 0, approved = 0, onLeaveToday = 0, upcoming = 0;
    const today = new Date();

    leaves.forEach(leave => {
      const start = new Date(leave.start_date);
      const end = new Date(leave.end_date);
      const status = leave.status;

      if (status === 'pending' || status === 0 || status === '0') pending++;
      if (status === 'approved' || status === 1 || status === '1') {
        approved++;
        if (start <= today && end >= today) {
          onLeaveToday++;
        } else if (start > today) {
          upcoming++;
        }
      }
    });

    pendingCount.textContent = pending;
    approvedCount.textContent = approved;
    onLeaveCount.textContent = onLeaveToday;
    upcomingCount.textContent = upcoming;
  }

  function setupActionButtons() {
    document.querySelectorAll('.approve-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedLeaveId = btn.dataset.id;
        selectedAction = 'approved';
        openModal(`Approve Leave #${selectedLeaveId}`);
      });
    });

    document.querySelectorAll('.reject-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedLeaveId = btn.dataset.id;
        selectedAction = 'rejected';
        openModal(`Reject Leave #${selectedLeaveId}`);
      });
    });
  }

  function openModal(title) {
    modalTitle.textContent = title;
    modalComment.value = '';
    modalConfirmBtn.textContent = selectedAction === 'approved' ? 'Approve' : 'Reject';
    modalConfirmBtn.className = selectedAction === 'approved'
      ? 'bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg'
      : 'bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg';

    leaveActionModal.classList.remove('hidden');
  }

  modalCancelBtn.addEventListener('click', () => {
    leaveActionModal.classList.add('hidden');
  });

  modalConfirmBtn.addEventListener('click', async () => {
    if (!selectedLeaveId || !selectedAction) return;

    try {
      const res = await fetch(`/api/leaves/${selectedLeaveId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: selectedAction })
      });

      if (!res.ok) throw new Error('Failed to update leave status');
      leaveActionModal.classList.add('hidden');
      fetchLeaves(); // Refresh after action
    } catch (err) {
      console.error('Error updating leave:', err);
      alert('Failed to update leave status.');
    }
  });

  // Fetch on load
  fetchLeaves();
});
