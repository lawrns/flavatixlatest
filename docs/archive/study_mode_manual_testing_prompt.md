# 🎯 STUDY MODE ENHANCEMENT - MANUAL TESTING PROMPT

**Date**: September 23, 2025
**Version**: 1.0.0
**Feature**: Study Mode Enhancement (Pre-defined & Collaborative approaches)
**Database**: ✅ **Migration Completed**
**Status**: **READY FOR MANUAL TESTING**

---

## 📋 TESTING OVERVIEW

**Test Environment**: Development server with Supabase database
**Duration**: 2-3 hours comprehensive testing
**Users Needed**: 3 test accounts (Host + 2 Participants)
**Success Criteria**: All user stories pass end-to-end validation

---

## 👥 TEST USER ACCOUNTS

Create these test accounts in your authentication system:

1. **Host User**: `host@example.com`
2. **Participant 1**: `participant1@example.com`
3. **Participant 2**: `participant2@example.com`

---

## 🎯 USER STORIES TO TEST

### **PRIMARY USER STORY**
**As a tasting host, I want flexible Study Mode options that allow me to either pre-plan all items or collaborate dynamically with participants, while still being able to participate as a taster myself, so that I can adapt the tasting experience to different group dynamics and preparation levels.**

---

## 📋 DETAILED TEST SCENARIOS

### **SCENARIO 1: Pre-defined Study Mode (Structured Tasting)**

#### **User Story**: As a host, I want to conduct a structured study tasting with all items planned upfront.

**Steps to Test**:

1. **Session Creation**
   - Login as **Host User**
   - Navigate to Dashboard
   - Click "Create Tasting Session"
   - Select "Study Mode"
   - ✅ Verify "Study Mode" selection works
   - Choose "Pre-defined Items" approach
   - ✅ Verify "Pre-defined Items" option appears and is selectable
   - Enter session name: "Pre-defined Coffee Study"
   - Select category: "coffee"
   - ✅ Verify category selection works
   - Add 2 tasting items: "Ethiopian Yirgacheffe", "Colombian Supremo"
   - ✅ Verify item addition form works
   - Click "Create Session"
   - ✅ Verify session creates successfully
   - ✅ Verify redirect to tasting page

2. **Host Experience in Pre-defined Mode**
   - ✅ Verify host sees "Host + Participant" role indicator
   - ✅ Verify host can see all pre-loaded items
   - ✅ Verify NO suggestion interface visible to host
   - ✅ Verify NO moderation dashboard visible
   - ✅ Verify host can add additional items if needed

3. **Participant Joining Pre-defined Session**
   - Open new browser/incognito window
   - Login as **Participant 1**
   - Navigate to the session URL (copy from host)
   - ✅ Verify automatic role assignment as "participant"
   - ✅ Verify role indicator shows "Participant"
   - ✅ Verify participant CANNOT see "Add Item" button
   - ✅ Verify NO suggestion interface visible
   - ✅ Verify NO moderation controls visible
   - ✅ Verify participant can ONLY evaluate pre-defined items

4. **Tasting Evaluation**
   - Both host and participant evaluate the pre-defined items
   - ✅ Verify all items visible to both users
   - ✅ Verify evaluation forms work correctly
   - ✅ Verify progress tracking updates (Completed: X/Y)
   - ✅ Verify flavor wheel interactions work

5. **Session Completion**
   - Host completes session
   - ✅ Verify completion successful
   - ✅ Verify results accessible to all participants
   - ✅ Verify session marked as completed in database

**Expected Results**:
- ✅ Study approach selection works perfectly
- ✅ Pre-defined items workflow functions correctly
- ✅ Role-based permissions strictly enforced
- ✅ No collaborative features interfere with structured flow

---

### **SCENARIO 2: Collaborative Study Mode (Interactive Tasting)**

#### **User Story**: As a host, I want an interactive study tasting where participants can suggest items.

**Steps to Test**:

1. **Session Creation**
   - Login as **Host User**
   - Navigate to Dashboard
   - Click "Create Tasting Session"
   - Select "Study Mode"
   - Choose "Collaborative" approach
   - ✅ Verify "Collaborative" option appears and is selectable
   - Enter session name: "Collaborative Wine Discovery"
   - Select category: "wine"
   - Click "Create Session"
   - ✅ Verify session creates successfully

2. **Initial Collaborative State**
   - ✅ Verify NO pre-loaded items (empty tasting list)
   - ✅ Verify host sees "Moderate" button in session header
   - ✅ Verify host has "Host + Participant" role indicator
   - ✅ Verify empty suggestions list

3. **Host Item Suggestion**
   - As host, click "Moderate" button
   - ✅ Verify moderation dashboard opens
   - As host, suggest an item: "Cabernet Sauvignon 2018"
   - ✅ Verify suggestion appears in moderation view
   - ✅ Verify suggestion shows as "pending" status

4. **Participant Joining & Suggesting**
   - Open new browser window
   - Login as **Participant 1**
   - Join the collaborative session
   - ✅ Verify role indicator shows "Participant"
   - ✅ Verify "💡 Suggestions" button visible
   - Click "💡 Suggestions" button
   - ✅ Verify suggestion form appears
   - Submit suggestion: "Pinot Noir 2019"
   - ✅ Verify suggestion submits successfully
   - ✅ Verify "Suggestion submitted!" toast appears

5. **Real-time Updates**
   - Switch back to **Host User** window
   - ✅ Verify new suggestion from Participant 1 appears immediately
   - ✅ Verify pending suggestions count updates
   - Switch back to **Participant 1** window
   - ✅ Verify NO immediate access to suggested items

6. **Host Moderation**
   - As **Host User**, in moderation dashboard
   - ✅ Verify both suggestions visible (host's and participant's)
   - Click "Approve" on "Cabernet Sauvignon 2018"
   - ✅ Verify status changes to "approved"
   - ✅ Verify item now appears in main tasting list
   - Click "Approve" on "Pinot Noir 2019"
   - ✅ Verify second item also appears in tasting list
   - Click "Reject" on any additional suggestions

7. **Cross-User Item Visibility**
   - Switch to **Participant 1** window
   - ✅ Verify both approved items now visible for evaluation
   - ✅ Verify participant can evaluate all approved items
   - Switch to **Host User** window
   - ✅ Verify host can also evaluate all items

8. **Second Participant Joining**
   - Open new browser window
   - Login as **Participant 2**
   - Join the session
   - ✅ Verify can see all already approved items
   - Submit new suggestion: "Malbec 2020"
   - ✅ Verify suggestion workflow works for new participant

9. **Host Dual Role Functionality**
   - As **Host User**, verify can:
   - ✅ Moderate suggestions in moderation dashboard
   - ✅ Evaluate items as participant
   - ✅ Switch between "🔧 Moderating" and "👤 Participating" modes
   - ✅ See both moderator controls and tasting interface

10. **Session Completion**
    - Host completes session
    - ✅ Verify all approved items included in final results
    - ✅ Verify collaborative metadata captured

**Expected Results**:
- ✅ Collaborative workflow functions end-to-end
- ✅ Real-time updates work across all browser windows
- ✅ Host dual role (moderator + participant) works seamlessly
- ✅ Multiple participants can collaborate simultaneously
- ✅ Suggestion approval/rejection works perfectly

---

### **SCENARIO 3: Role Management & Permissions**

#### **User Story**: As a host, I want to manage participant roles while maintaining session integrity.

**Steps to Test**:

1. **Role Assignment Verification**
   - Create collaborative session as **Host User**
   - Have **Participant 1** and **Participant 2** join
   - ✅ Verify host gets "both" role automatically
   - ✅ Verify participants get "participant" role automatically

2. **Permission Enforcement**
   - **Host Permissions** (verify all work):
     - ✅ Can moderate suggestions (approve/reject)
     - ✅ Can add items directly
     - ✅ Can manage participant roles
     - ✅ Can view all suggestions (pending + approved)
   - **Participant Permissions** (verify restrictions):
     - ✅ Can submit suggestions
     - ❌ Cannot moderate suggestions
     - ❌ Cannot manage roles
     - ❌ Cannot view other users' pending suggestions

3. **Role Changes**
   - As **Host User**, in moderation dashboard
   - Change **Participant 1** role to "Host + Participant"
   - ✅ Verify Participant 1 gains moderation permissions
   - ✅ Verify Participant 1 can now see moderation controls
   - Change **Participant 1** back to "Participant"
   - ✅ Verify permissions revoked
   - ✅ Verify UI updates appropriately

4. **Role Indicator Accuracy**
   - ✅ Host shows "Host + Participant"
   - ✅ Participants show "Participant"
   - ✅ Role changes reflect immediately across all users
   - ✅ "(You)" indicator appears for current user

**Expected Results**:
- ✅ Role-based permissions strictly enforced
- ✅ Role changes work in real-time
- ✅ No security violations possible
- ✅ UI clearly indicates roles and permissions

---

### **SCENARIO 4: Host Unresponsive Handling**

#### **User Story**: As a participant, I want the session to continue even if the host becomes unresponsive.

**Steps to Test**:

1. **Normal Collaborative Session**
   - Create collaborative session with host and participants
   - Have participants submit suggestions
   - Host moderates normally
   - ✅ Verify standard workflow works

2. **Simulate Host Unresponsiveness**
   - Host stops interacting (close browser tab/simulate disconnect)
   - Participants continue submitting suggestions
   - ✅ Verify suggestions queue properly (don't disappear)
   - ✅ Verify participants can still evaluate existing approved items
   - ✅ Verify session remains accessible

3. **Graceful Degradation**
   - Wait for unresponsiveness detection (system handles automatically)
   - ✅ Verify no session crashes
   - ✅ Verify participants get appropriate messaging
   - ✅ Verify pending suggestions remain for later moderation

4. **Host Returns**
   - Host reconnects (open new tab, login)
   - ✅ Verify can resume moderation of queued suggestions
   - ✅ Verify system recovers gracefully
   - ✅ Verify no data loss occurred

**Expected Results**:
- ✅ System handles host unresponsiveness gracefully
- ✅ Participants can continue working
- ✅ Data integrity preserved
- ✅ Recovery works when host returns

---

### **SCENARIO 5: Error Handling & Edge Cases**

#### **User Story**: As a user, I want robust error handling and clear feedback for all edge cases.

**Steps to Test**:

1. **Form Validation**
   - Try submitting empty suggestions
   - ✅ Verify helpful error messages
   - Try submitting suggestions >100 characters
   - ✅ Verify length validation works
   - Try creating session without study approach selected
   - ✅ Verify validation prevents creation

2. **Permission Violations**
   - As **Participant**, try to access moderation dashboard URL directly
   - ✅ Verify access denied
   - Try to moderate suggestions
   - ✅ Verify operation fails with appropriate error
   - Try to change roles
   - ✅ Verify unauthorized

3. **Network Issues**
   - Simulate slow network during suggestion submission
   - ✅ Verify no duplicate submissions
   - Simulate network disconnect during moderation
   - ✅ Verify operation can be retried

4. **Race Conditions**
   - Have multiple participants submit suggestions simultaneously
   - ✅ Verify all suggestions processed correctly
   - Have host moderate while participants submit
   - ✅ Verify no conflicts or data loss

**Expected Results**:
- ✅ Robust error handling throughout
- ✅ Clear, helpful error messages
- ✅ Data integrity maintained
- ✅ Graceful handling of edge cases

---

## ✅ SUCCESS CRITERIA CHECKLIST

### **Must Pass (Blocking)**
- [ ] **Pre-defined Mode**: Complete workflow works end-to-end
- [ ] **Collaborative Mode**: Real-time collaboration functions
- [ ] **Role Management**: Permissions strictly enforced
- [ ] **Host Dual Role**: Seamless moderator + participant experience
- [ ] **Unresponsive Handling**: Graceful degradation works
- [ ] **Error Handling**: Robust validation and feedback
- [ ] **Security**: No unauthorized access possible
- [ ] **Data Integrity**: No data loss or corruption

### **Should Pass (Important)**
- [ ] **Real-time Updates**: <100ms latency across browsers
- [ ] **UI Responsiveness**: Smooth interactions
- [ ] **Accessibility**: Keyboard navigation works
- [ ] **Performance**: No degradation with multiple users
- [ ] **User Experience**: Intuitive workflows

---

## 🐛 BUG REPORT TEMPLATE

**If any test fails, report using this format:**

```
**Title**: [Clear, descriptive title]

**Environment**:
- Browser: [Chrome/Firefox/etc]
- OS: [macOS/Windows/etc]
- User Role: [Host/Participant]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happened]

**Severity**: [Critical/High/Medium/Low]
**Screenshot**: [Attach if UI-related]
```

---

## 🏁 TESTING COMPLETION

**When all scenarios pass**:
- ✅ Mark feature as **PRODUCTION READY**
- ✅ Update documentation
- ✅ Prepare deployment notes
- ✅ Notify stakeholders

**If issues found**:
- 🐛 Report bugs with detailed reproduction steps
- 🔄 Re-test after fixes
- 📊 Track resolution progress

---

**🎯 READY TO START TESTING!**

**Estimated Time**: 2-3 hours for complete validation
**Success Rate Target**: 100% of user stories must pass
**Environment**: Development server with migrated database

**Begin with Scenario 1: Pre-defined Study Mode** 🚀

