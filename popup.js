
function task2branch() {
  const issueEl        = document.querySelector('[data-testid="issue.views.issue-base.foundation.breadcrumbs.current-issue.item"]')
  const issueTitleEl   = document.querySelector('[data-testid="issue.views.issue-base.foundation.summary.heading"]')
  const titleContainer = document.querySelector('[data-testid="issue-field-summary.ui.issue-field-summary-inline-edit--container"]')

  if ( ! issueEl || ! issueTitleEl || ! titleContainer ) {
    return ''
  }

  const issueTitle     = issueTitleEl.innerText
  const issueId        = issueEl.innerText

  // format the branch name - lowercase and no special chars
  let branchName = issueId + ' ' + issueTitle.toLowerCase()
  branchName = branchName.replace(/\s+/g, '-') // whitespace to dash
  branchName = branchName.replace(/[^A-Z0-9\-]+/gi, '') // delete any other special char
  branchName = 'feature/' + branchName

  // append the feature name to UI
  if ( ! document.getElementById('task-branch-name') ) {
      const branchEl   = document.createElement('div');
      branchEl.innerText = branchName
      branchEl.setAttribute('id','task-branch-name')
      branchEl.style.paddingLeft  = '10px'
      branchEl.style.marginBottom = '10px'
      branchEl.style.color        = '#6B778C'
      titleContainer.appendChild(branchEl);
  }
  issueEl.focus() // we have to focus on document to allow clipboard API in bookmarklet context

  return branchName
}

function clearPopup() {
  const labelField = document.getElementById('task2branch__label')
  const nameField = document.getElementById('task2branch__name')
  const infoField = document.getElementById('task2branch__info')
  nameField.style.display = 'none';
  infoField.style.display = 'none';
}

function showNotJiraNotice() {
  const labelField = document.getElementById('task2branch__label')
  const nameField = document.getElementById('task2branch__name')
  const infoField = document.getElementById('task2branch__info')
  labelField.innerText = "This page doesn't seem to be a Jira issue page";
  nameField.style.display = 'none';
  infoField.style.display = 'none';
}

function showBranchName(branchName) {
  const nameField = document.getElementById('task2branch__name')
  const labelField = document.getElementById('task2branch__label')
  const infoField = document.getElementById('task2branch__info')
  labelField.innerText = "Feature branch name:";
  nameField.innerText = branchName
  nameField.style.display = 'block';
  infoField.style.display = 'none';
}

chrome.tabs.query({
  active: true,
  currentWindow: true
}, async function(tabs) {
  let activeTab = tabs[0];
  if ( activeTab.url.indexOf('atlassian.net') != -1 ) {
    clearPopup()

    await chrome.scripting
    .executeScript({
      target : {tabId : activeTab.id},
      func : task2branch,
    }).then(( response ) => {
      if ( response[0] ) {
        if ( ! response[0].result) {
          showNotJiraNotice()
        } else {
          showBranchName(response[0].result)
        }
        
        const nameField = document.getElementById('task2branch__name')
        nameField.addEventListener('click', function(event) {
          navigator.clipboard.writeText(nameField.innerText).then(function() {
            const infoField = document.getElementById('task2branch__info')
            infoField.style.display = 'block';
          })
        })
      }
    })
  } else {
    showNotJiraNotice()
  }
});
