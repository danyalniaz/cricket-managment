/* ==========================================================================
   CRICKET TOURNAMENT SCORER & MANAGEMENT SYSTEM - JAVASCRIPT ENGINE
   ========================================================================== */

const STORAGE_KEY = 'CRICKET_TOURNAMENT_DB_V3';

class CricketApp {
  constructor() {
    this.state = {
      tournaments: [
        {
          id: 'tourney_1',
          name: 'Pakistan Premier Cricket Cup 2026',
          season: '2026',
          location: 'Gaddafi Stadium, Lahore',
          format: 'League + Knockout',
          startDate: '2026-09-01',
          endDate: '2026-09-20'
        }
      ],
      activeTournamentId: 'tourney_1',
      teams: [],
      players: [],
      matches: [],
      activeMatch: null
    };

    this.charts = {};
    this.navigationStack = [];
    this.currentView = null;
    this.init();
  }

  init() {
    const hasLoaded = this.loadState();
    if (!hasLoaded) {
      this.loadDemoData();
    }

    this.bindEvents();
    this.renderAll();
    this.switchView('dashboard');
    this.playSplashScreen();
  }

  /* ==========================================================================
     SPLASH INTRO ANIMATION (BABAR AZAM SHOT IMPACT)
     ========================================================================== */
  playSplashScreen() {
    const splash = document.getElementById('app-splash-screen');
    if (!splash) return;

    splash.classList.remove('hidden');

    const ball = splash.querySelector('.flying-cricket-ball');
    const crack = splash.querySelector('.glass-crack-effect');

    if (ball) {
      ball.style.animation = 'none';
      ball.offsetHeight;
      ball.style.animation = 'zoomBallToScreen 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards';
    }

    if (crack) {
      crack.style.animation = 'none';
      crack.offsetHeight;
      crack.style.animation = 'crackScreen 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1.25s forwards';
    }

    if (this.splashTimer) clearTimeout(this.splashTimer);
    this.splashTimer = setTimeout(() => {
      this.closeSplashScreen();
    }, 2300);
  }

  closeSplashScreen() {
    const splash = document.getElementById('app-splash-screen');
    if (splash) {
      splash.classList.add('hidden');
    }
    if (this.splashTimer) clearTimeout(this.splashTimer);
  }

  /* ==========================================================================
     STATE MANAGEMENT & LOCALSTORAGE
     ========================================================================== */
  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  loadState() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const loadedState = JSON.parse(data);
        // Migration for single-tournament to multi-tournament array
        if (loadedState.tournament && !loadedState.tournaments) {
          const tId = 'tourney_' + Date.now();
          loadedState.tournament.id = tId;
          loadedState.tournaments = [loadedState.tournament];
          loadedState.activeTournamentId = tId;
          (loadedState.teams || []).forEach(t => { if (!t.tournamentId) t.tournamentId = tId; });
          (loadedState.matches || []).forEach(m => { if (!m.tournamentId) m.tournamentId = tId; });
        }
        this.state = loadedState;
        return true;
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
    return false;
  }

  loadDemoData() {
    const demoTourneyId = 'tourney_1';
    const demoTournament = {
      id: demoTourneyId,
      name: 'Pakistan Premier Cricket Cup 2026',
      season: '2026',
      location: 'Gaddafi Stadium, Lahore',
      format: 'League + Knockout',
      startDate: '2026-09-01',
      endDate: '2026-09-20'
    };

    const demoTeams = [
      { id: 't1', tournamentId: demoTourneyId, name: 'Islamabad Warriors', coach: 'Misbah-ul-Haq', color: '#10b981' },
      { id: 't2', tournamentId: demoTourneyId, name: 'Lahore Lions', coach: 'Aqib Javed', color: '#3b82f6' },
      { id: 't3', tournamentId: demoTourneyId, name: 'Peshawar Eagles', coach: 'Inzamam-ul-Haq', color: '#f59e0b' },
      { id: 't4', tournamentId: demoTourneyId, name: 'Karachi Kings', coach: 'Wasim Akram', color: '#8b5cf6' }
    ];

    const demoPlayers = [
      // Islamabad Warriors
      { id: 'p101', name: 'Babar Azam', teamId: 't1', role: 'Batsman', jersey: 56 },
      { id: 'p102', name: 'Shadab Khan', teamId: 't1', role: 'All-Rounder', jersey: 7 },
      { id: 'p103', name: 'Shaheen Afridi', teamId: 't1', role: 'Bowler', jersey: 10 },
      { id: 'p104', name: 'Azam Khan', teamId: 't1', role: 'Wicket-Keeper', jersey: 77 },
      { id: 'p105', name: 'Faheem Ashraf', teamId: 't1', role: 'All-Rounder', jersey: 41 },
      { id: 'p106', name: 'Asif Ali', teamId: 't1', role: 'Batsman', jersey: 45 },
      { id: 'p107', name: 'Hasan Ali', teamId: 't1', role: 'Bowler', jersey: 32 },
      { id: 'p108', name: 'Mohammad Wasim', teamId: 't1', role: 'Bowler', jersey: 12 },
      { id: 'p109', name: 'Colin Munro', teamId: 't1', role: 'Batsman', jersey: 82 },
      { id: 'p110', name: 'Alex Hales', teamId: 't1', role: 'Batsman', jersey: 3 },
      { id: 'p111', name: 'Rumman Raees', teamId: 't1', role: 'Bowler', jersey: 19 },

      // Lahore Lions
      { id: 'p201', name: 'Fakhar Zaman', teamId: 't2', role: 'Batsman', jersey: 39 },
      { id: 'p202', name: 'Haris Rauf', teamId: 't2', role: 'Bowler', jersey: 150 },
      { id: 'p203', name: 'Mohammad Rizwan', teamId: 't2', role: 'Wicket-Keeper', jersey: 16 },
      { id: 'p204', name: 'Rashid Khan', teamId: 't2', role: 'Bowler', jersey: 19 },
      { id: 'p205', name: 'David Wiese', teamId: 't2', role: 'All-Rounder', jersey: 96 },
      { id: 'p206', name: 'Abdullah Shafique', teamId: 't2', role: 'Batsman', jersey: 57 },
      { id: 'p207', name: 'Zaman Khan', teamId: 't2', role: 'Bowler', jersey: 28 },
      { id: 'p208', name: 'Sikandar Raza', teamId: 't2', role: 'All-Rounder', jersey: 24 },
      { id: 'p209', name: 'Kamran Ghulam', teamId: 't2', role: 'Batsman', jersey: 88 },
      { id: 'p210', name: 'Dilbar Hussain', teamId: 't2', role: 'Bowler', jersey: 33 },
      { id: 'p211', name: 'Sam Billings', teamId: 't2', role: 'Wicket-Keeper', jersey: 7 },

      // Peshawar Eagles
      { id: 'p301', name: 'Saim Ayub', teamId: 't3', role: 'Batsman', jersey: 63 },
      { id: 'p302', name: 'Rovman Powell', teamId: 't3', role: 'Batsman', jersey: 52 },
      { id: 'p303', name: 'Tom Kohler-Cadmore', teamId: 't3', role: 'Batsman', jersey: 31 },
      { id: 'p304', name: 'Aamer Jamal', teamId: 't3', role: 'All-Rounder', jersey: 65 },
      { id: 'p305', name: 'Luke Wood', teamId: 't3', role: 'Bowler', jersey: 14 },
      { id: 'p306', name: 'Arshad Iqbal', teamId: 't3', role: 'Bowler', jersey: 90 },
      { id: 'p307', name: 'Mohammad Haris', teamId: 't3', role: 'Wicket-Keeper', jersey: 29 },
      { id: 'p308', name: 'Salman Irshad', teamId: 't3', role: 'Bowler', jersey: 47 },
      { id: 'p309', name: 'Haseebullah Khan', teamId: 't3', role: 'Batsman', jersey: 22 },
      { id: 'p310', name: 'Khurram Shahzad', teamId: 't3', role: 'Bowler', jersey: 18 },
      { id: 'p311', name: 'Asif Afridi', teamId: 't3', role: 'All-Rounder', jersey: 99 },

      // Karachi Kings
      { id: 'p401', name: 'Shoaib Malik', teamId: 't4', role: 'All-Rounder', jersey: 18 },
      { id: 'p402', name: 'Shan Masood', teamId: 't4', role: 'Batsman', jersey: 94 },
      { id: 'p403', name: 'James Vince', teamId: 't4', role: 'Batsman', jersey: 14 },
      { id: 'p404', name: 'Hasan Nawaz', teamId: 't4', role: 'Batsman', jersey: 11 },
      { id: 'p405', name: 'Imad Wasim', teamId: 't4', role: 'All-Rounder', jersey: 9 },
      { id: 'p406', name: 'Mohammad Amir', teamId: 't4', role: 'Bowler', jersey: 5 },
      { id: 'p407', name: 'Tabraiz Shamsi', teamId: 't4', role: 'Bowler', jersey: 26 },
      { id: 'p408', name: 'Mir Hamza', teamId: 't4', role: 'Bowler', jersey: 71 },
      { id: 'p409', name: 'Irfan Khan Niazi', teamId: 't4', role: 'Batsman', jersey: 35 },
      { id: 'p410', name: 'Anwar Ali', teamId: 't4', role: 'All-Rounder', jersey: 33 },
      { id: 'p411', name: 'Akif Javed', teamId: 't4', role: 'Bowler', jersey: 80 }
    ];

    const demoCompletedMatch = {
      id: 'm101',
      tournamentId: demoTourneyId,
      matchNumber: 'Match 1',
      date: '2026-08-25',
      time: '19:00',
      venue: 'Gaddafi Stadium, Lahore',
      teamAId: 't1',
      teamBId: 't2',
      maxOvers: 20,
      stage: 'Group Stage',
      umpire: 'Aleem Dar',
      scorer: 'Official Admin',
      tossWinner: 't1',
      tossDecision: 'Bat',
      status: 'COMPLETED',
      winnerId: 't1',
      resultSummary: 'Islamabad Warriors won by 18 runs',
      potPlayerId: 'p101',
      innings: [
        {
          teamId: 't1',
          runs: 185,
          wickets: 5,
          overs: 20.0,
          extras: { wide: 4, noBall: 1, bye: 2, legBye: 3, penalty: 0 },
          battingScorecard: [
            { playerId: 'p101', runs: 82, balls: 48, fours: 8, sixes: 4, isOut: true, dismissal: 'c Haris Rauf b Rashid Khan' },
            { playerId: 'p109', runs: 34, balls: 22, fours: 3, sixes: 2, isOut: true, dismissal: 'b Shaheen Afridi' },
            { playerId: 'p102', runs: 45, balls: 28, fours: 4, sixes: 2, isOut: false, dismissal: 'Not Out' },
            { playerId: 'p106', runs: 14, balls: 8, fours: 1, sixes: 1, isOut: false, dismissal: 'Not Out' }
          ],
          bowlingScorecard: [
            { playerId: 'p202', overs: 4, maidens: 0, runs: 42, wickets: 2, wides: 2, noBalls: 1 },
            { playerId: 'p204', overs: 4, maidens: 0, runs: 28, wickets: 2, wides: 1, noBalls: 0 },
            { playerId: 'p207', overs: 4, maidens: 0, runs: 45, wickets: 1, wides: 1, noBalls: 0 }
          ],
          fallOfWickets: [
            { wicketNum: 1, score: 54, over: '5.2', batterName: 'Colin Munro' },
            { wicketNum: 2, score: 142, over: '15.4', batterName: 'Babar Azam' }
          ]
        },
        {
          teamId: 't2',
          runs: 167,
          wickets: 8,
          overs: 20.0,
          extras: { wide: 5, noBall: 2, bye: 0, legBye: 2, penalty: 0 },
          battingScorecard: [
            { playerId: 'p201', runs: 58, balls: 36, fours: 6, sixes: 3, isOut: true, dismissal: 'c Shadab Khan b Shaheen Afridi' },
            { playerId: 'p203', runs: 42, balls: 31, fours: 4, sixes: 1, isOut: true, dismissal: 'st Azam Khan b Shadab Khan' },
            { playerId: 'p206', runs: 22, balls: 18, fours: 2, sixes: 0, isOut: true, dismissal: 'lbw b Hasan Ali' }
          ],
          bowlingScorecard: [
            { playerId: 'p103', overs: 4, maidens: 1, runs: 24, wickets: 3, wides: 2, noBalls: 1 },
            { playerId: 'p102', overs: 4, maidens: 0, runs: 30, wickets: 3, wides: 1, noBalls: 0 },
            { playerId: 'p107', overs: 4, maidens: 0, runs: 38, wickets: 2, wides: 2, noBalls: 1 }
          ],
          fallOfWickets: [
            { wicketNum: 1, score: 68, over: '7.1', batterName: 'Fakhar Zaman' },
            { wicketNum: 2, score: 110, over: '12.3', batterName: 'Mohammad Rizwan' }
          ]
        }
      ],
      commentary: [
        { overBall: '20.0', ballText: 'Hasan Ali to Zaman Khan — 1 run. Innings Finished!' },
        { overBall: '19.5', ballText: 'Hasan Ali to Zaman Khan — SIX!' },
        { overBall: '15.4', ballText: 'Shaheen Afridi to Fakhar Zaman — WICKET! Caught at deep midwicket.' }
      ]
    };

    this.state.tournaments = [demoTournament];
    this.state.activeTournamentId = demoTourneyId;
    this.state.teams = demoTeams;
    this.state.players = demoPlayers;
    this.state.matches = [demoCompletedMatch];
    this.saveState();
  }

  getActiveTournament() {
    return this.state.tournaments.find(t => t.id === this.state.activeTournamentId) || this.state.tournaments[0];
  }

  bindEvents() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.getAttribute('data-view');
        if (view) this.switchView(view);
      });
    });

    // Mobile nav toggle
    const mobileBtn = document.getElementById('mobile-nav-toggle');
    if (mobileBtn) {
      mobileBtn.addEventListener('click', () => {
        this.toggleSidebar();
      });
    }

    // Theme toggle
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        themeBtn.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
      });
    }

    // Load Demo Data Button
    const demoBtn = document.getElementById('load-demo-btn');
    if (demoBtn) {
      demoBtn.addEventListener('click', () => {
        if (confirm('Load demo tournament data? This will add demo tournament and sample teams.')) {
          this.loadDemoData();
          this.renderAll();
          alert('Demo Tournament "Pakistan Premier Cricket Cup 2026" loaded successfully!');
        }
      });
    }

    // Tournament Setup Form
    const setupForm = document.getElementById('tournament-setup-form');
    if (setupForm) {
      setupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const activeT = this.getActiveTournament();
        if (activeT) {
          activeT.name = document.getElementById('setup-name').value;
          activeT.season = document.getElementById('setup-season').value;
          activeT.location = document.getElementById('setup-location').value;
          activeT.startDate = document.getElementById('setup-start-date').value;
          activeT.endDate = document.getElementById('setup-end-date').value;
          activeT.format = document.getElementById('setup-format').value;
          this.saveState();
          this.renderAll();
          alert('Tournament details updated successfully!');
        }
      });
    }

    // Create Match Form
    const createMatchForm = document.getElementById('create-match-form');
    if (createMatchForm) {
      createMatchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.initNewMatch();
      });
    }

    // Global Search
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleGlobalSearch(e.target.value);
      });
    }
  }

  /* ==========================================================================
     MULTI-TOURNAMENT MANAGEMENT
     ========================================================================== */
  renderTournamentDropdown() {
    const select = document.getElementById('active-tournament-select');
    if (!select) return;

    let options = '';
    this.state.tournaments.forEach(t => {
      options += `<option value="${t.id}" ${t.id === this.state.activeTournamentId ? 'selected' : ''}>${t.name} (${t.season})</option>`;
    });
    select.innerHTML = options;
  }

  switchActiveTournament(tournamentId) {
    this.state.activeTournamentId = tournamentId;
    this.saveState();
    this.renderAll();
  }

  openNewTournamentModal() {
    document.getElementById('new-tournament-form').reset();
    document.getElementById('modal-create-tournament').classList.add('active');
  }

  submitNewTournament(e) {
    e.preventDefault();
    const newTourney = {
      id: 'tourney_' + Date.now(),
      name: document.getElementById('new-tourney-name').value,
      season: document.getElementById('new-tourney-season').value,
      location: document.getElementById('new-tourney-location').value,
      startDate: document.getElementById('new-tourney-start-date').value,
      endDate: document.getElementById('new-tourney-end-date').value,
      format: document.getElementById('new-tourney-format').value
    };

    this.state.tournaments.push(newTourney);
    this.state.activeTournamentId = newTourney.id;
    this.saveState();
    this.closeModal('modal-create-tournament');
    this.renderAll();
    alert(`New Tournament "${newTourney.name}" created and set as active!`);
  }

  deleteCurrentTournament() {
    const activeT = this.getActiveTournament();
    if (!activeT) return;

    if (!confirm(`CAUTION: Are you sure you want to delete tournament "${activeT.name}" (${activeT.season})?\n\nAll matches, teams, and player records associated with this tournament will be permanently deleted.`)) {
      return;
    }

    // Filter out the active tournament
    this.state.tournaments = this.state.tournaments.filter(t => t.id !== activeT.id);
    
    // Filter out teams belonging to this tournament
    const deletedTeamIds = this.state.teams.filter(t => t.tournamentId === activeT.id).map(t => t.id);
    this.state.teams = this.state.teams.filter(t => t.tournamentId !== activeT.id);

    // Filter out players belonging to deleted teams
    this.state.players = this.state.players.filter(p => !deletedTeamIds.includes(p.teamId));

    // Filter out matches belonging to this tournament
    this.state.matches = this.state.matches.filter(m => m.tournamentId !== activeT.id);

    // Clear active match if it belonged to this tournament
    if (this.state.activeMatch && this.state.activeMatch.tournamentId === activeT.id) {
      this.state.activeMatch = null;
    }

    // If no tournaments remain, create a default tournament automatically
    if (this.state.tournaments.length === 0) {
      const newTId = 'tourney_' + Date.now();
      const defaultT = {
        id: newTId,
        name: 'New Cricket Tournament 2026',
        season: '2026',
        location: 'Local Cricket Ground',
        format: 'League + Knockout',
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
      };
      this.state.tournaments.push(defaultT);
      this.state.activeTournamentId = newTId;
    } else {
      this.state.activeTournamentId = this.state.tournaments[0].id;
    }

    this.saveState();
    this.renderAll();
    this.switchView('dashboard');
    alert(`Tournament "${activeT.name}" deleted successfully!`);
  }

  /* ==========================================================================
     QUICK ADD PLAYER (DURING MATCH / SETUP)
     ========================================================================== */
  openQuickPlayerModal(defaultTeamId = null) {
    const teamSelect = document.getElementById('quick-player-team');
    const availableTeams = this.getTeamsForActiveTournament();

    let teamOpts = '';
    availableTeams.forEach(t => {
      const isSel = (defaultTeamId && t.id === defaultTeamId) ? 'selected' : '';
      teamOpts += `<option value="${t.id}" ${isSel}>${t.name}</option>`;
    });
    teamSelect.innerHTML = teamOpts;

    document.getElementById('quick-player-form').reset();
    document.getElementById('modal-quick-player').classList.add('active');
  }

  openQuickPlayerModalForBatTeam() {
    const match = this.state.activeMatch;
    if (!match) {
      this.openQuickPlayerModal();
      return;
    }
    const inn = match.innings[match.currentInningsIndex];
    this.openQuickPlayerModal(inn.teamId);
  }

  openQuickPlayerModalForBowlTeam() {
    const match = this.state.activeMatch;
    if (!match) {
      this.openQuickPlayerModal();
      return;
    }
    const bowlTeamId = match.innings[1 - match.currentInningsIndex].teamId;
    this.openQuickPlayerModal(bowlTeamId);
  }

  submitQuickPlayer(e) {
    e.preventDefault();
    const name = document.getElementById('quick-player-name').value;
    const teamId = document.getElementById('quick-player-team').value;
    const jersey = parseInt(document.getElementById('quick-player-jersey').value) || 0;
    const role = document.getElementById('quick-player-role').value;

    const newPlayer = {
      id: 'p_' + Date.now(),
      name: name,
      teamId: teamId,
      jersey: jersey,
      role: role
    };

    this.state.players.push(newPlayer);
    this.saveState();
    this.closeModal('modal-quick-player');

    // Re-populate active modals and views if currently in live scorer or openers setup
    if (this.state.activeMatch) {
      if (document.getElementById('modal-openers').classList.contains('active')) {
        this.openOpenersModal();
      } else if (document.getElementById('modal-wicket').classList.contains('active')) {
        this.openWicketModal();
      } else if (document.getElementById('modal-bowler').classList.contains('active')) {
        this.openBowlerSelectModal();
      }
      this.renderLiveScorer();
    } else {
      this.populateCreateMatchForm();
      this.renderPlayersList();
      this.renderTeamsGrid();
    }

    alert(`Player "${name}" added to Team & Tournament records successfully!`);
  }

  switchView(viewId, isBack = false) {
    if (!isBack && this.currentView && this.currentView !== viewId) {
      this.navigationStack.push(this.currentView);
    }
    this.currentView = viewId;

    const backBtn = document.getElementById('header-back-btn');
    if (backBtn) {
      backBtn.style.display = (this.navigationStack.length > 0) ? 'inline-flex' : 'none';
    }

    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

    const targetSection = document.getElementById(`view-${viewId}`);
    const targetNavItem = document.querySelector(`.nav-item[data-view="${viewId}"]`);

    if (targetSection) targetSection.classList.add('active');
    if (targetNavItem) targetNavItem.classList.add('active');

    // Title update
    const titleElem = document.getElementById('current-page-title');
    if (titleElem) {
      const titleMap = {
        'dashboard': 'Tournament Dashboard',
        'live-scorer': 'Live Cricket Scorer Engine',
        'create-match': 'Create Match & Toss Setup',
        'matches': 'Match History & Fixtures',
        'teams': 'Teams & Squad Management',
        'players': 'Player Directory & Roster',
        'points-table': 'Tournament Standings & NRR',
        'statistics': 'Tournament Leaderboards & Stats',
        'records': 'Tournament Records',
        'knockout': 'Playoff Bracket & Finals',
        'setup': 'Tournament Setup',
        'settings': 'Data Management & Backup',
        'scorecard': 'Match Scorecard'
      };
      titleElem.textContent = titleMap[viewId] || 'Cricket Scorer Pro';
    }

    // Close mobile menu
    this.closeSidebar();

    // Render view specific content
    if (viewId === 'dashboard') this.renderDashboard();
    else if (viewId === 'live-scorer') this.renderLiveScorer();
    else if (viewId === 'create-match') this.populateCreateMatchForm();
    else if (viewId === 'matches') this.renderMatchesList();
    else if (viewId === 'teams') this.renderTeamsGrid();
    else if (viewId === 'players') this.renderPlayersList();
    else if (viewId === 'points-table') this.renderPointsTable();
    else if (viewId === 'statistics') this.renderStatisticsView();
    else if (viewId === 'records') this.renderRecordsView();
    else if (viewId === 'knockout') this.renderKnockoutView();
    else if (viewId === 'setup') this.populateSetupForm();
  }

  goBack() {
    if (this.navigationStack.length > 0) {
      const prevView = this.navigationStack.pop();
      this.switchView(prevView, true);
    }
  }

  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('active');
  }

  closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
  }

  renderAll() {
    this.renderTournamentDropdown();
    this.renderDashboard();
    this.renderPointsTable();
  }

  /* ==========================================================================
     1. DASHBOARD VIEW RENDERER
     ========================================================================== */
  renderDashboard() {
    const t = this.getActiveTournament();
    document.getElementById('dash-tourney-name').textContent = t ? t.name : 'Cricket Tournament';
    document.getElementById('dash-tourney-season').textContent = `${t ? t.season : '2026'} Season`;
    document.getElementById('dash-location').textContent = t ? t.location : 'Stadium Venue';
    document.getElementById('dash-format').textContent = t ? t.format : 'League + Knockout';

    // Compute stats filtered by active tournament
    const tournamentTeams = this.getTeamsForActiveTournament();
    const tournamentMatches = this.getMatchesForActiveTournament();

    const totalTeams = tournamentTeams.length;
    const totalMatches = tournamentMatches.length;
    const completedMatches = tournamentMatches.filter(m => m.status === 'COMPLETED').length;
    const upcomingMatches = totalMatches - completedMatches;

    let totalRuns = 0, totalWickets = 0, totalSixes = 0, totalFours = 0;
    tournamentMatches.forEach(m => {
      (m.innings || []).forEach(inn => {
        totalRuns += (inn.runs || 0);
        totalWickets += (inn.wickets || 0);
        (inn.battingScorecard || []).forEach(b => {
          totalSixes += (b.sixes || 0);
          totalFours += (b.fours || 0);
        });
      });
    });

    document.getElementById('stat-total-teams').textContent = totalTeams;
    document.getElementById('stat-total-matches').textContent = totalMatches;
    document.getElementById('stat-completed-matches').textContent = completedMatches;
    document.getElementById('stat-upcoming-matches').textContent = upcomingMatches;
    document.getElementById('stat-total-runs').textContent = totalRuns;
    document.getElementById('stat-total-wickets').textContent = totalWickets;
    document.getElementById('stat-total-sixes').textContent = totalSixes;
    document.getElementById('stat-total-fours').textContent = totalFours;

    // Leaderboards
    const playerStats = this.computeAllPlayerStats();
    const topScorer = playerStats.sort((a, b) => b.runs - a.runs)[0];
    const topBowler = playerStats.sort((a, b) => b.wickets - a.wickets)[0];
    const potWinner = playerStats.sort((a, b) => b.potScore - a.potScore)[0];
    const mostSixes = playerStats.sort((a, b) => b.sixes - a.sixes)[0];

    document.getElementById('leader-top-scorer').textContent = topScorer ? `${topScorer.name} (${topScorer.runs} runs)` : '-';
    document.getElementById('leader-top-bowler').textContent = topBowler ? `${topBowler.name} (${topBowler.wickets} wkts)` : '-';
    document.getElementById('leader-pot').textContent = potWinner ? `${potWinner.name} (${potWinner.potScore} pts)` : '-';
    document.getElementById('leader-most-sixes').textContent = mostSixes ? `${mostSixes.name} (${mostSixes.sixes} 6s)` : '-';

    // Dashboard Recent Matches Container
    const dashContainer = document.getElementById('dashboard-matches-container');
    if (dashContainer) {
      if (tournamentMatches.length === 0) {
        dashContainer.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 1.5rem;">No matches scheduled for this tournament yet.</p>`;
      } else {
        let html = '';
        tournamentMatches.slice(0, 3).forEach(m => {
          const teamA = this.getTeam(m.teamAId);
          const teamB = this.getTeam(m.teamBId);
          const inn1 = m.innings ? m.innings[0] : null;
          const inn2 = m.innings ? m.innings[1] : null;

          html += `
            <div style="background: var(--bg-input); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 0.75rem;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="font-weight: 700; font-size: 0.85rem; color: var(--primary);">${m.matchNumber} • ${m.venue}</span>
                <span class="badge ${m.status === 'LIVE' ? 'badge-live' : m.status === 'COMPLETED' ? 'badge-completed' : 'badge-upcoming'}">${m.status}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 1rem; margin-bottom: 0.4rem;">
                <div>${teamA ? teamA.name : 'Team A'}: <span style="color: var(--primary);">${inn1 ? inn1.runs + '/' + inn1.wickets : '-'}</span></div>
                <div>${teamB ? teamB.name : 'Team B'}: <span style="color: var(--accent);">${inn2 ? inn2.runs + '/' + inn2.wickets : '-'}</span></div>
              </div>
              <div style="font-size: 0.85rem; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center;">
                <span>${m.resultSummary || 'Match Scheduled'}</span>
                <button class="btn btn-secondary btn-sm" onclick="app.viewScorecard('${m.id}')">Scorecard</button>
              </div>
            </div>
          `;
        });
        dashContainer.innerHTML = html;
      }
    }
  }

  /* ==========================================================================
     2. CREATE MATCH & TOSS SETUP
     ========================================================================== */
  populateCreateMatchForm() {
    const teamASelect = document.getElementById('match-team-a');
    const teamBSelect = document.getElementById('match-team-b');

    const availableTeams = this.getTeamsForActiveTournament();

    if (availableTeams.length < 2) {
      alert('You need at least 2 teams in the active tournament before setting up a match.');
      this.switchView('teams');
      return;
    }

    let options = '';
    availableTeams.forEach(t => {
      options += `<option value="${t.id}">${t.name}</option>`;
    });

    teamASelect.innerHTML = options;
    teamBSelect.innerHTML = options;
    if (availableTeams.length > 1) {
      teamBSelect.selectedIndex = 1;
    }

    this.onMatchTeamChange();

    document.getElementById('match-number').value = `Match ${this.getMatchesForActiveTournament().length + 1}`;
    document.getElementById('match-date').value = new Date().toISOString().split('T')[0];
  }

  onMatchTeamChange() {
    const teamAId = document.getElementById('match-team-a').value;
    const teamBId = document.getElementById('match-team-b').value;
    const tossWinnerSelect = document.getElementById('toss-winner');

    const teamA = this.getTeam(teamAId);
    const teamB = this.getTeam(teamBId);

    let options = '';
    if (teamA) options += `<option value="${teamA.id}">${teamA.name}</option>`;
    if (teamB) options += `<option value="${teamB.id}">${teamB.name}</option>`;
    tossWinnerSelect.innerHTML = options;
  }

  initNewMatch() {
    const teamAId = document.getElementById('match-team-a').value;
    const teamBId = document.getElementById('match-team-b').value;

    if (teamAId === teamBId) {
      alert('Error: Please select two different teams!');
      return;
    }

    const tossWinnerId = document.getElementById('toss-winner').value;
    const tossDecision = document.getElementById('toss-decision').value;

    let batTeamId, bowlTeamId;
    if (tossDecision === 'Bat') {
      batTeamId = tossWinnerId;
      bowlTeamId = tossWinnerId === teamAId ? teamBId : teamAId;
    } else {
      bowlTeamId = tossWinnerId;
      batTeamId = tossWinnerId === teamAId ? teamBId : teamAId;
    }

    const activeT = this.getActiveTournament();

    const newMatch = {
      id: 'm_' + Date.now(),
      tournamentId: activeT.id,
      matchNumber: document.getElementById('match-number').value,
      date: document.getElementById('match-date').value,
      time: document.getElementById('match-time').value,
      venue: document.getElementById('match-venue').value,
      teamAId: teamAId,
      teamBId: teamBId,
      maxOvers: parseInt(document.getElementById('match-overs').value) || 20,
      stage: document.getElementById('match-stage').value,
      umpire: document.getElementById('match-umpire').value,
      scorer: document.getElementById('match-scorer').value,
      tossWinner: tossWinnerId,
      tossDecision: tossDecision,
      status: 'LIVE',
      currentInningsIndex: 0,
      innings: [
        {
          teamId: batTeamId,
          runs: 0,
          wickets: 0,
          overs: 0,
          legalBalls: 0,
          extras: { wide: 0, noBall: 0, bye: 0, legBye: 0, penalty: 0 },
          battingScorecard: [],
          bowlingScorecard: [],
          fallOfWickets: [],
          currentStrikerId: null,
          currentNonStrikerId: null,
          currentBowlerId: null,
          currentOverBalls: [],
          overRunsCounter: 0
        },
        {
          teamId: bowlTeamId,
          runs: 0,
          wickets: 0,
          overs: 0,
          legalBalls: 0,
          extras: { wide: 0, noBall: 0, bye: 0, legBye: 0, penalty: 0 },
          battingScorecard: [],
          bowlingScorecard: [],
          fallOfWickets: [],
          currentStrikerId: null,
          currentNonStrikerId: null,
          currentBowlerId: null,
          currentOverBalls: [],
          overRunsCounter: 0
        }
      ],
      commentary: [],
      ballHistoryStack: []
    };

    this.state.activeMatch = newMatch;
    this.state.matches.unshift(newMatch);
    this.saveState();

    this.switchView('live-scorer');
    this.openOpenersModal();
  }

  /* ==========================================================================
     OPENERS & BATTER SELECTOR MODAL
     ========================================================================== */
  openOpenersModal() {
    const match = this.state.activeMatch;
    if (!match || match.status !== 'LIVE') return;

    const inn = match.innings[match.currentInningsIndex];
    const batTeam = this.getTeam(inn.teamId);
    const bowlTeam = this.getTeam(match.innings[1 - match.currentInningsIndex].teamId);

    const batPlayers = this.getPlayersByTeam(inn.teamId);
    const bowlPlayers = this.getPlayersByTeam(match.innings[1 - match.currentInningsIndex].teamId);

    document.getElementById('openers-bat-team-name').textContent = batTeam ? batTeam.name : 'Batting Team';
    document.getElementById('openers-bowl-team-name').textContent = bowlTeam ? bowlTeam.name : 'Bowling Team';

    const strikerSelect = document.getElementById('opener-striker');
    const nonStrikerSelect = document.getElementById('opener-non-striker');
    const bowlerSelect = document.getElementById('opener-bowler');

    let batOpts = '';
    if (batPlayers.length === 0) {
      batOpts = '<option value="">No players in squad (Click + Add Player above)</option>';
    } else {
      batPlayers.forEach(p => {
        batOpts += `<option value="${p.id}">${p.name} (${p.role})</option>`;
      });
    }

    let bowlOpts = '';
    if (bowlPlayers.length === 0) {
      bowlOpts = '<option value="">No bowlers in squad (Click + Add Player above)</option>';
    } else {
      bowlPlayers.forEach(p => {
        bowlOpts += `<option value="${p.id}">${p.name} (${p.role})</option>`;
      });
    }

    strikerSelect.innerHTML = batOpts;
    nonStrikerSelect.innerHTML = batOpts;
    bowlerSelect.innerHTML = bowlOpts;

    if (batPlayers.length > 1) {
      nonStrikerSelect.selectedIndex = 1;
    }

    // Pre-select if already chosen
    if (inn.currentStrikerId) strikerSelect.value = inn.currentStrikerId;
    if (inn.currentNonStrikerId) nonStrikerSelect.value = inn.currentNonStrikerId;
    if (inn.currentBowlerId) bowlerSelect.value = inn.currentBowlerId;

    document.getElementById('modal-openers').classList.add('active');
  }

  submitOpeners(e) {
    e.preventDefault();
    const match = this.state.activeMatch;
    if (!match) return;

    const strikerId = document.getElementById('opener-striker').value;
    const nonStrikerId = document.getElementById('opener-non-striker').value;
    const bowlerId = document.getElementById('opener-bowler').value;

    if (!strikerId || !nonStrikerId || !bowlerId) {
      alert('Please select or add Striker, Non-Striker, and Opening Bowler!');
      return;
    }

    if (strikerId === nonStrikerId) {
      alert('Error: Striker and Non-Striker must be two different players!');
      return;
    }

    const inn = match.innings[match.currentInningsIndex];

    inn.currentStrikerId = strikerId;
    inn.currentNonStrikerId = nonStrikerId;
    inn.currentBowlerId = bowlerId;

    // Add Striker to scorecard if not present
    let sScore = inn.battingScorecard.find(b => b.playerId === strikerId);
    if (!sScore) {
      inn.battingScorecard.push({ playerId: strikerId, runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false, dismissal: 'Not Out' });
    }

    // Add Non-Striker to scorecard if not present
    let nsScore = inn.battingScorecard.find(b => b.playerId === nonStrikerId);
    if (!nsScore) {
      inn.battingScorecard.push({ playerId: nonStrikerId, runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false, dismissal: 'Not Out' });
    }

    // Add Bowler to bowling scorecard if not present
    let bwScore = inn.bowlingScorecard.find(b => b.playerId === bowlerId);
    if (!bwScore) {
      inn.bowlingScorecard.push({ playerId: bowlerId, overs: 0, maidens: 0, runs: 0, wickets: 0, wides: 0, noBalls: 0 });
    }

    this.closeModal('modal-openers');
    this.saveState();
    this.renderLiveScorer();
  }

  /* ==========================================================================
     3. LIVE SCORER ENGINE
     ========================================================================== */
  renderLiveScorer() {
    const match = this.state.activeMatch;
    const noMatchBanner = document.getElementById('no-active-match-banner');
    const scorerContainer = document.getElementById('live-scorer-container');

    if (!match || match.status !== 'LIVE') {
      noMatchBanner.style.display = 'block';
      scorerContainer.style.display = 'none';
      return;
    }

    noMatchBanner.style.display = 'none';
    scorerContainer.style.display = 'block';

    const inn = match.innings[match.currentInningsIndex];

    // If openers/bowler not selected yet, prompt selector modal
    if (!inn.currentStrikerId || !inn.currentNonStrikerId || !inn.currentBowlerId) {
      this.openOpenersModal();
      return;
    }

    const batTeam = this.getTeam(inn.teamId);
    const bowlTeam = this.getTeam(match.innings[1 - match.currentInningsIndex].teamId);

    // Meta Header
    document.getElementById('live-match-meta').textContent = `${match.matchNumber.toUpperCase()} • ${match.venue.toUpperCase()}`;
    document.getElementById('live-batting-flag').textContent = batTeam ? batTeam.name.charAt(0) : 'A';
    document.getElementById('live-batting-team-name').textContent = batTeam ? batTeam.name : 'Batting Team';
    document.getElementById('live-runs').textContent = inn.runs;
    document.getElementById('live-wickets').textContent = inn.wickets;
    document.getElementById('live-overs').textContent = this.formatOvers(inn.overs);
    document.getElementById('live-max-overs').textContent = match.maxOvers;

    document.getElementById('live-bowling-flag').textContent = bowlTeam ? bowlTeam.name.charAt(0) : 'B';
    document.getElementById('live-bowling-team-name').textContent = bowlTeam ? bowlTeam.name : 'Bowling Team';

    // Target calculation if 2nd Innings
    if (match.currentInningsIndex === 1) {
      const target = match.innings[0].runs + 1;
      const runsNeeded = target - inn.runs;
      const totalBalls = match.maxOvers * 6;
      const ballsBowled = Math.floor(inn.overs) * 6 + (inn.legalBalls % 6);
      const ballsLeft = totalBalls - ballsBowled;
      const rrr = ballsLeft > 0 ? ((runsNeeded / ballsLeft) * 6).toFixed(2) : '-';

      document.getElementById('live-target-display').textContent = `Target: ${target}`;
      document.getElementById('live-target-subtext').textContent = `Needs ${runsNeeded} in ${ballsLeft}b`;
      document.getElementById('live-crr').textContent = this.calculateCRR(inn.runs, inn.overs);
      document.getElementById('live-rrr').textContent = rrr;
      document.getElementById('live-runs-needed').textContent = runsNeeded > 0 ? runsNeeded : 0;
      document.getElementById('live-balls-left').textContent = ballsLeft > 0 ? ballsLeft : 0;
    } else {
      document.getElementById('live-target-display').textContent = `1st Innings`;
      document.getElementById('live-target-subtext').textContent = `Setting Target`;
      document.getElementById('live-crr').textContent = this.calculateCRR(inn.runs, inn.overs);
      document.getElementById('live-rrr').textContent = '-';
      document.getElementById('live-runs-needed').textContent = '-';
      document.getElementById('live-balls-left').textContent = '-';
    }

    // Active Batters Table
    const batTbody = document.getElementById('live-batters-tbody');
    let batHtml = '';
    inn.battingScorecard.filter(b => !b.isOut).forEach(b => {
      const player = this.getPlayer(b.playerId);
      const isStriker = b.playerId === inn.currentStrikerId;
      const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0';

      batHtml += `
        <tr class="${isStriker ? 'striker-highlight' : ''}">
          <td>${player ? player.name : 'Batter'} ${isStriker ? '<i class="fa-solid fa-cricket-bat-ball"></i> *' : ''}</td>
          <td style="font-weight: 800;">${b.runs}</td>
          <td>${b.balls}</td>
          <td>${b.fours}</td>
          <td>${b.sixes}</td>
          <td>${sr}</td>
        </tr>
      `;
    });
    batTbody.innerHTML = batHtml;

    // Active Bowler Table
    const bowlTbody = document.getElementById('live-bowler-tbody');
    const activeBowlerScore = inn.bowlingScorecard.find(b => b.playerId === inn.currentBowlerId);
    let bowlHtml = '';
    if (activeBowlerScore) {
      const player = this.getPlayer(activeBowlerScore.playerId);
      const eco = activeBowlerScore.overs > 0 ? (activeBowlerScore.runs / activeBowlerScore.overs).toFixed(2) : '0.00';
      bowlHtml = `
        <tr>
          <td style="font-weight: 800; color: var(--primary);">${player ? player.name : 'Bowler'} *</td>
          <td>${this.formatOvers(activeBowlerScore.overs)}</td>
          <td>${activeBowlerScore.maidens}</td>
          <td>${activeBowlerScore.runs}</td>
          <td style="font-weight: 800; color: var(--danger);">${activeBowlerScore.wickets}</td>
          <td>${eco}</td>
        </tr>
      `;
    }
    bowlTbody.innerHTML = bowlHtml;

    // Current Over Ball Tags
    const ballsTrack = document.getElementById('live-current-over-balls');
    let ballsHtml = '';
    (inn.currentOverBalls || []).forEach(tag => {
      let cls = '';
      if (tag === '4') cls = 'b-4';
      else if (tag === '6') cls = 'b-6';
      else if (tag.includes('W')) cls = 'b-w';
      else if (tag.includes('WD') || tag.includes('NB') || tag.includes('B')) cls = 'b-extra';

      ballsHtml += `<span class="ball-tag ${cls}">${tag}</span>`;
    });
    ballsTrack.innerHTML = ballsHtml || '<span style="color: var(--text-muted); font-size: 0.85rem;">Over starting...</span>';

    // Commentary feed
    const commList = document.getElementById('live-commentary-feed');
    let commHtml = '';
    (match.commentary || []).slice().reverse().forEach(c => {
      const isWicket = c.ballText.includes('WICKET');
      const isBoundary = c.ballText.includes('FOUR') || c.ballText.includes('SIX');
      commHtml += `
        <div class="commentary-item ${isWicket ? 'wicket' : isBoundary ? 'boundary' : ''}">
          <span style="font-weight: 800; color: var(--primary); font-size: 0.8rem; width: 45px;">${c.overBall}</span>
          <span>${c.ballText}</span>
        </div>
      `;
    });
    commList.innerHTML = commHtml;
  }

  recordBall(runs) {
    const match = this.state.activeMatch;
    if (!match || match.status !== 'LIVE') return;

    const inn = match.innings[match.currentInningsIndex];

    if (!inn.currentStrikerId || !inn.currentBowlerId) {
      this.openOpenersModal();
      return;
    }

    this.saveSnapshot();

    const striker = inn.battingScorecard.find(b => b.playerId === inn.currentStrikerId);
    let bowler = inn.bowlingScorecard.find(b => b.playerId === inn.currentBowlerId);

    if (!bowler) {
      alert('Please select a bowler first!');
      this.openBowlerSelectModal();
      return;
    }

    // Update Runs
    inn.runs += runs;
    striker.runs += runs;
    striker.balls += 1;
    if (runs === 4) striker.fours += 1;
    if (runs === 6) striker.sixes += 1;

    bowler.runs += runs;
    inn.legalBalls += 1;
    inn.overs = Math.floor(inn.legalBalls / 6) + (inn.legalBalls % 6) / 10;
    bowler.overs = Math.floor(inn.legalBalls / 6) + (inn.legalBalls % 6) / 10;
    inn.overRunsCounter += runs;

    const ballTag = runs === 0 ? '0' : runs.toString();
    inn.currentOverBalls.push(ballTag);

    const strikerPlayer = this.getPlayer(striker.playerId);
    const bowlerPlayer = this.getPlayer(bowler.playerId);
    const ballText = `${bowlerPlayer ? bowlerPlayer.name : 'Bowler'} to ${strikerPlayer ? strikerPlayer.name : 'Striker'} — ${runs === 4 ? 'FOUR!' : runs === 6 ? 'SIX!' : runs + ' run(s)'}`;

    match.commentary.push({
      overBall: `${this.formatOvers(inn.overs)}`,
      ballText: ballText
    });

    // Strike Rotation for odd runs
    if (runs % 2 !== 0) {
      this.swapStriker();
    }

    // Check Over Completion (6 legal balls)
    if (inn.legalBalls % 6 === 0) {
      if (inn.overRunsCounter === 0) bowler.maidens += 1;
      inn.currentOverBalls = [];
      inn.overRunsCounter = 0;
      this.swapStriker(); // Swap strike at end of over
      this.saveState();
      this.checkInningsStatus();
      if (match.status === 'LIVE') {
        this.openBowlerSelectModal();
      }
    } else {
      this.saveState();
      this.checkInningsStatus();
    }

    this.renderLiveScorer();
  }

  recordExtra(type) {
    const match = this.state.activeMatch;
    if (!match || match.status !== 'LIVE') return;

    const inn = match.innings[match.currentInningsIndex];
    if (!inn.currentStrikerId || !inn.currentBowlerId) {
      this.openOpenersModal();
      return;
    }

    this.saveSnapshot();

    const striker = inn.battingScorecard.find(b => b.playerId === inn.currentStrikerId);
    let bowler = inn.bowlingScorecard.find(b => b.playerId === inn.currentBowlerId);

    if (type === 'WD') {
      inn.runs += 1;
      inn.extras.wide += 1;
      bowler.runs += 1;
      bowler.wides += 1;
      inn.currentOverBalls.push('WD');

      match.commentary.push({
        overBall: `${this.formatOvers(inn.overs)}`,
        ballText: `WIDE delivery +1 run`
      });
    } else if (type === 'NB') {
      // Enhanced NO BALL logic: Prompt for runs scored off the bat!
      const batRunsInput = prompt("NO BALL! Enter runs scored off the bat (0 for no bat runs, 1, 2, 3, 4, 6):", "0");
      if (batRunsInput === null) return; // User cancelled
      const batRuns = parseInt(batRunsInput) || 0;

      const totalRunsOnNB = 1 + batRuns; // 1 Extra + bat runs
      inn.runs += totalRunsOnNB;
      inn.extras.noBall += 1;

      // Credit striker
      striker.runs += batRuns;
      striker.balls += 1;
      if (batRuns === 4) striker.fours += 1;
      if (batRuns === 6) striker.sixes += 1;

      // Charge bowler
      bowler.runs += totalRunsOnNB;
      bowler.noBalls += 1;

      const tagText = batRuns > 0 ? `NB+${batRuns}` : 'NB';
      inn.currentOverBalls.push(tagText);

      const strikerPlayer = this.getPlayer(striker.playerId);
      const bowlerPlayer = this.getPlayer(bowler.playerId);
      const ballText = `NO BALL! ${bowlerPlayer ? bowlerPlayer.name : 'Bowler'} to ${strikerPlayer ? strikerPlayer.name : 'Striker'} — +1 Extra${batRuns > 0 ? ` + ${batRuns} Run(s)` : ''}`;

      match.commentary.push({
        overBall: `${this.formatOvers(inn.overs)}`,
        ballText: ballText
      });

      if (batRuns % 2 !== 0) {
        this.swapStriker();
      }
    } else if (type === 'B' || type === 'LB') {
      const extraRuns = parseInt(prompt(`Enter ${type === 'B' ? 'Bye' : 'Leg Bye'} runs:`, '1')) || 1;
      inn.runs += extraRuns;
      if (type === 'B') inn.extras.bye += extraRuns;
      else inn.extras.legBye += extraRuns;

      striker.balls += 1;
      inn.legalBalls += 1;
      inn.overs = Math.floor(inn.legalBalls / 6) + (inn.legalBalls % 6) / 10;
      bowler.overs = Math.floor(inn.legalBalls / 6) + (inn.legalBalls % 6) / 10;
      inn.currentOverBalls.push(`${type}${extraRuns}`);

      if (extraRuns % 2 !== 0) this.swapStriker();

      match.commentary.push({
        overBall: `${this.formatOvers(inn.overs)}`,
        ballText: `${extraRuns} ${type === 'B' ? 'Bye' : 'Leg Bye'} run(s)`
      });

      if (inn.legalBalls % 6 === 0) {
        inn.currentOverBalls = [];
        this.swapStriker();
        this.saveState();
        this.checkInningsStatus();
        if (match.status === 'LIVE') {
          this.openBowlerSelectModal();
        }
      } else {
        this.saveState();
        this.checkInningsStatus();
      }
    } else if (type === 'PEN') {
      const penRuns = parseInt(prompt('Enter Penalty runs:', '5')) || 5;
      inn.runs += penRuns;
      inn.extras.penalty += penRuns;
      this.saveState();
      this.checkInningsStatus();
    }

    this.renderLiveScorer();
  }

  openWicketModal() {
    const match = this.state.activeMatch;
    if (!match || match.status !== 'LIVE') return;

    const inn = match.innings[match.currentInningsIndex];
    const batTeamPlayers = this.getPlayersByTeam(inn.teamId);
    const bowlTeamPlayers = this.getPlayersByTeam(match.innings[1 - match.currentInningsIndex].teamId);

    // Active batters
    const activeBatters = inn.battingScorecard.filter(b => !b.isOut);
    let disOptions = '';
    activeBatters.forEach(b => {
      const p = this.getPlayer(b.playerId);
      disOptions += `<option value="${b.playerId}">${p ? p.name : 'Batter'}</option>`;
    });
    document.getElementById('wicket-dismissed-batter').innerHTML = disOptions;

    // Fielder select
    let fielderOptions = '<option value="">None / N/A</option>';
    bowlTeamPlayers.forEach(p => {
      fielderOptions += `<option value="${p.id}">${p.name}</option>`;
    });
    document.getElementById('wicket-fielder').innerHTML = fielderOptions;

    // Un-batted players
    const battedIds = inn.battingScorecard.map(b => b.playerId);
    const remainingPlayers = batTeamPlayers.filter(p => !battedIds.includes(p.id));

    let nextOptions = '';
    if (remainingPlayers.length === 0) {
      nextOptions = '<option value="ALL_OUT">All Out / No More Batsmen</option>';
    } else {
      remainingPlayers.forEach(p => {
        nextOptions += `<option value="${p.id}">${p.name}</option>`;
      });
    }
    document.getElementById('wicket-next-batter').innerHTML = nextOptions;

    document.getElementById('modal-wicket').classList.add('active');
    this.onWicketTypeChange();
  }

  onWicketTypeChange() {
    const type = document.getElementById('wicket-type').value;
    const fielderGrp = document.getElementById('wicket-fielder-group');
    if (type === 'Caught' || type === 'Run Out' || type === 'Stumped') {
      fielderGrp.style.display = 'block';
    } else {
      fielderGrp.style.display = 'none';
    }
  }

  submitWicket(e) {
    e.preventDefault();
    const match = this.state.activeMatch;
    if (!match) return;

    this.saveSnapshot();

    const inn = match.innings[match.currentInningsIndex];
    const dismissedId = document.getElementById('wicket-dismissed-batter').value;
    const wicketType = document.getElementById('wicket-type').value;
    const fielderId = document.getElementById('wicket-fielder').value;
    const nextBatterId = document.getElementById('wicket-next-batter').value;

    const dismissedScore = inn.battingScorecard.find(b => b.playerId === dismissedId);
    const bowlerScore = inn.bowlingScorecard.find(b => b.playerId === inn.currentBowlerId);

    dismissedScore.isOut = true;
    const fielder = this.getPlayer(fielderId);
    const bowler = this.getPlayer(inn.currentBowlerId);

    let dismissalText = `b ${bowler ? bowler.name : 'Bowler'}`;
    if (wicketType === 'Caught') dismissalText = `c ${fielder ? fielder.name : 'Fielder'} b ${bowler ? bowler.name : 'Bowler'}`;
    else if (wicketType === 'LBW') dismissalText = `lbw b ${bowler ? bowler.name : 'Bowler'}`;
    else if (wicketType === 'Stumped') dismissalText = `st ${fielder ? fielder.name : 'Fielder'} b ${bowler ? bowler.name : 'Bowler'}`;
    else if (wicketType === 'Run Out') dismissalText = `run out (${fielder ? fielder.name : 'Fielder'})`;
    else if (wicketType === 'Hit Wicket') dismissalText = `hit wicket b ${bowler ? bowler.name : 'Bowler'}`;

    dismissedScore.dismissal = dismissalText;

    // Credit wicket to bowler if not run out / retired
    if (wicketType !== 'Run Out' && wicketType !== 'Retired Hurt' && wicketType !== 'Retired Out') {
      if (bowlerScore) bowlerScore.wickets += 1;
    }

    inn.wickets += 1;
    inn.legalBalls += 1;
    inn.overs = Math.floor(inn.legalBalls / 6) + (inn.legalBalls % 6) / 10;
    if (bowlerScore) bowlerScore.overs = Math.floor(inn.legalBalls / 6) + (inn.legalBalls % 6) / 10;

    inn.fallOfWickets.push({
      wicketNum: inn.wickets,
      score: inn.runs,
      over: this.formatOvers(inn.overs),
      batterName: this.getPlayer(dismissedId)?.name || 'Batter'
    });

    inn.currentOverBalls.push('W');

    match.commentary.push({
      overBall: `${this.formatOvers(inn.overs)}`,
      ballText: `WICKET! ${this.getPlayer(dismissedId)?.name} ${dismissalText} - ${inn.runs}/${inn.wickets}`
    });

    // Add next batter if available
    if (nextBatterId !== 'ALL_OUT') {
      inn.battingScorecard.push({
        playerId: nextBatterId,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        isOut: false,
        dismissal: 'Not Out'
      });

      if (dismissedId === inn.currentStrikerId) inn.currentStrikerId = nextBatterId;
      else inn.currentNonStrikerId = nextBatterId;
    }

    this.closeModal('modal-wicket');

    const isOverComplete = (inn.legalBalls % 6 === 0);

    if (isOverComplete) {
      inn.currentOverBalls = [];
      this.swapStriker();
    }

    this.saveState();
    this.checkInningsStatus();

    // Only open Bowler select modal if match is STILL LIVE after checkInningsStatus
    if (isOverComplete && match.status === 'LIVE' && inn.wickets < 10) {
      this.openBowlerSelectModal();
    }

    this.renderLiveScorer();
  }

  openBowlerSelectModal() {
    const match = this.state.activeMatch;
    if (!match || match.status !== 'LIVE') return;

    const inn = match.innings[match.currentInningsIndex];
    const bowlTeamPlayers = this.getPlayersByTeam(match.innings[1 - match.currentInningsIndex].teamId);

    let options = '';
    bowlTeamPlayers.forEach(p => {
      if (p.id !== inn.currentBowlerId) {
        options += `<option value="${p.id}">${p.name} (${p.role})</option>`;
      }
    });

    document.getElementById('select-next-bowler').innerHTML = options;
    document.getElementById('modal-bowler').classList.add('active');
  }

  submitBowlerSelect(e) {
    e.preventDefault();
    const match = this.state.activeMatch;
    if (!match) return;

    const nextBowlerId = document.getElementById('select-next-bowler').value;
    const inn = match.innings[match.currentInningsIndex];

    let bowlerScore = inn.bowlingScorecard.find(b => b.playerId === nextBowlerId);
    if (!bowlerScore) {
      bowlerScore = { playerId: nextBowlerId, overs: 0, maidens: 0, runs: 0, wickets: 0, wides: 0, noBalls: 0 };
      inn.bowlingScorecard.push(bowlerScore);
    }

    inn.currentBowlerId = nextBowlerId;
    this.closeModal('modal-bowler');
    this.saveState();
    this.renderLiveScorer();
  }

  swapStriker() {
    const inn = this.state.activeMatch.innings[this.state.activeMatch.currentInningsIndex];
    const temp = inn.currentStrikerId;
    inn.currentStrikerId = inn.currentNonStrikerId;
    inn.currentNonStrikerId = temp;
  }

  saveSnapshot() {
    const match = this.state.activeMatch;
    if (!match) return;
    match.ballHistoryStack.push(JSON.stringify(match.innings));
  }

  undoLastBall() {
    const match = this.state.activeMatch;
    if (!match || match.ballHistoryStack.length === 0) {
      alert('Nothing to undo!');
      return;
    }

    const previousInningsState = JSON.parse(match.ballHistoryStack.pop());
    match.innings = previousInningsState;
    if (match.commentary.length > 0) match.commentary.pop();

    this.saveState();
    this.renderLiveScorer();
    alert('Last delivery undone successfully!');
  }

  checkInningsStatus() {
    const match = this.state.activeMatch;
    if (!match) return;

    const inn = match.innings[match.currentInningsIndex];
    const maxBalls = match.maxOvers * 6;

    // Check 1st Innings Completion
    if (match.currentInningsIndex === 0) {
      if (inn.legalBalls >= maxBalls || inn.wickets >= 10) {
        this.closeModal('modal-bowler');
        this.closeModal('modal-wicket');
        this.closeModal('modal-openers');
        alert(`1st Innings Complete! Target set to ${inn.runs + 1} runs.`);
        this.switchInnings();
      }
    }
    // Check 2nd Innings Completion
    else if (match.currentInningsIndex === 1) {
      const target = match.innings[0].runs + 1;
      const inn1Team = this.getTeam(match.innings[0].teamId);
      const inn2Team = this.getTeam(match.innings[1].teamId);

      if (inn.runs >= target) {
        // 2nd innings won
        const wicketsRemaining = 10 - inn.wickets;
        match.status = 'COMPLETED';
        match.winnerId = inn2Team.id;
        match.resultSummary = `${inn2Team ? inn2Team.name : 'Batting Team'} won by ${wicketsRemaining} wicket(s)`;
        this.finishMatch();
      } else if (inn.legalBalls >= maxBalls || inn.wickets >= 10) {
        match.status = 'COMPLETED';
        if (inn.runs < match.innings[0].runs) {
          const runDiff = match.innings[0].runs - inn.runs;
          match.winnerId = inn1Team.id;
          match.resultSummary = `${inn1Team ? inn1Team.name : 'Team'} won by ${runDiff} run(s)`;
        } else {
          match.winnerId = 'TIE';
          match.resultSummary = 'Match Tied!';
        }
        this.finishMatch();
      }
    }
  }

  switchInnings() {
    const match = this.state.activeMatch;
    this.closeModal('modal-bowler');
    this.closeModal('modal-wicket');
    this.closeModal('modal-openers');

    match.currentInningsIndex = 1;

    const secondInn = match.innings[1];
    secondInn.currentStrikerId = null;
    secondInn.currentNonStrikerId = null;
    secondInn.currentBowlerId = null;
    secondInn.battingScorecard = [];
    secondInn.bowlingScorecard = [];

    this.saveState();
    this.renderLiveScorer();
    this.openOpenersModal();
  }

  finishMatch() {
    const match = this.state.activeMatch;

    // Close any open modals when match is finished
    this.closeModal('modal-bowler');
    this.closeModal('modal-wicket');
    this.closeModal('modal-openers');

    // Auto Player of Match calculation
    const allPlayersInMatch = [];
    match.innings.forEach(inn => {
      (inn.battingScorecard || []).forEach(b => {
        let p = allPlayersInMatch.find(x => x.id === b.playerId);
        if (!p) { p = { id: b.playerId, score: 0 }; allPlayersInMatch.push(p); }
        p.score += (b.runs * 1) + (b.fours * 1) + (b.sixes * 2);
      });
      (inn.bowlingScorecard || []).forEach(bw => {
        let p = allPlayersInMatch.find(x => x.id === bw.playerId);
        if (!p) { p = { id: bw.playerId, score: 0 }; allPlayersInMatch.push(p); }
        p.score += (bw.wickets * 25) + (bw.maidens * 15);
      });
    });

    allPlayersInMatch.sort((a, b) => b.score - a.score);
    match.potPlayerId = allPlayersInMatch[0] ? allPlayersInMatch[0].id : null;

    this.state.activeMatch = null;
    this.saveState();

    // Automatically sync and re-render all tournament stats, standings, leaderboards, and records
    this.renderAll();
    this.renderPointsTable();
    this.renderStatisticsView();
    this.renderRecordsView();

    alert(`MATCH FINISHED!\n${match.resultSummary}\n\nAll Match Details, Player Statistics, Points Table & Tournament Records updated automatically!`);
    this.viewScorecard(match.id);
  }

  /* ==========================================================================
     4. SCORECARD VIEW & IMAGE DOWNLOAD
     ========================================================================== */
  viewScorecard(matchId) {
    const match = this.state.matches.find(m => m.id === matchId);
    if (!match) return;

    this.closeModal('modal-bowler');
    this.closeModal('modal-wicket');
    this.closeModal('modal-openers');

    const teamA = this.getTeam(match.teamAId);
    const teamB = this.getTeam(match.teamBId);
    const tourney = this.state.tournaments.find(t => t.id === match.tournamentId) || this.getActiveTournament();
    const pot = this.getPlayer(match.potPlayerId);

    const scorecardContainer = document.getElementById('scorecard-content');
    if (!scorecardContainer) return;

    let html = `
      <div class="card" style="background: linear-gradient(135deg, #1e293b, #0f172a); border-color: var(--primary);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <span class="badge badge-completed">${match.stage}</span>
            <div style="font-size: 1.1rem; font-weight: 800; color: var(--primary); margin-top: 0.4rem; text-transform: uppercase;">
              <i class="fa-solid fa-trophy"></i> ${tourney ? tourney.name : 'Cricket Tournament'} ${tourney && tourney.season ? `(${tourney.season})` : ''}
            </div>
            <h2 style="font-weight: 900; font-size: 1.6rem; margin-top: 0.2rem;">
              ${match.matchNumber}: ${teamA ? teamA.name : 'Team A'} <span style="color: var(--accent);">VS</span> ${teamB ? teamB.name : 'Team B'}
            </h2>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.2rem;">
              <i class="fa-solid fa-location-dot"></i> Venue: ${match.venue} | <i class="fa-solid fa-calendar"></i> Date: ${match.date}
            </p>
          </div>

          <div class="no-print-capture" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button id="btn-download-image" class="btn btn-primary" onclick="app.downloadScorecardImage()"><i class="fa-solid fa-image"></i> Save as Image (PNG)</button>
            <button class="btn btn-secondary" onclick="window.print()"><i class="fa-solid fa-print"></i> Print Scorecard</button>
          </div>
        </div>

        <div style="margin-top: 1.25rem; padding: 1rem; background: rgba(16, 185, 129, 0.15); border-radius: var(--radius-md); border: 1px solid var(--primary);">
          <div style="font-size: 1.3rem; font-weight: 900; color: var(--primary);">${match.resultSummary}</div>
          <div style="font-size: 0.9rem; color: var(--text-main); margin-top: 0.2rem;">
            <i class="fa-solid fa-star" style="color: var(--warning);"></i> <strong>Player of the Match:</strong> ${pot ? pot.name : 'N/A'}
          </div>
        </div>
      </div>
    `;

    (match.innings || []).forEach((inn, idx) => {
      const team = this.getTeam(inn.teamId);
      html += `
        <div class="card">
          <div class="card-header">
            <div class="card-title">${idx + 1}st Innings — ${team ? team.name : 'Team'}</div>
            <div style="font-size: 1.2rem; font-weight: 900; color: var(--primary);">${inn.runs}/${inn.wickets} (${this.formatOvers(inn.overs)} Ov)</div>
          </div>

          <h5 style="margin-bottom: 0.5rem; color: var(--text-muted);">BATTING</h5>
          <div class="table-responsive" style="margin-bottom: 1.5rem;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Batter</th>
                  <th>Dismissal</th>
                  <th>R</th>
                  <th>B</th>
                  <th>4s</th>
                  <th>6s</th>
                  <th>SR</th>
                </tr>
              </thead>
              <tbody>
      `;

      (inn.battingScorecard || []).forEach(b => {
        const p = this.getPlayer(b.playerId);
        const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0';
        html += `
          <tr>
            <td style="font-weight: 700;">${p ? p.name : 'Batter'}</td>
            <td style="color: var(--text-muted); font-size: 0.85rem;">${b.dismissal}</td>
            <td style="font-weight: 800;">${b.runs}</td>
            <td>${b.balls}</td>
            <td>${b.fours}</td>
            <td>${b.sixes}</td>
            <td>${sr}</td>
          </tr>
        `;
      });

      const totalExtras = (inn.extras?.wide || 0) + (inn.extras?.noBall || 0) + (inn.extras?.bye || 0) + (inn.extras?.legBye || 0);

      html += `
              </tbody>
            </table>
          </div>

          <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem;">
            <strong>Extras:</strong> ${totalExtras} (w ${inn.extras?.wide || 0}, nb ${inn.extras?.noBall || 0}, b ${inn.extras?.bye || 0}, lb ${inn.extras?.legBye || 0})
          </div>

          <h5 style="margin-bottom: 0.5rem; color: var(--text-muted);">BOWLING</h5>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Bowler</th>
                  <th>O</th>
                  <th>M</th>
                  <th>R</th>
                  <th>W</th>
                  <th>ECO</th>
                </tr>
              </thead>
              <tbody>
      `;

      (inn.bowlingScorecard || []).forEach(bw => {
        const p = this.getPlayer(bw.playerId);
        const eco = bw.overs > 0 ? (bw.runs / bw.overs).toFixed(2) : '0.00';
        html += `
          <tr>
            <td style="font-weight: 700;">${p ? p.name : 'Bowler'}</td>
            <td>${this.formatOvers(bw.overs)}</td>
            <td>${bw.maidens}</td>
            <td>${bw.runs}</td>
            <td style="font-weight: 800; color: var(--danger);">${bw.wickets}</td>
            <td>${eco}</td>
          </tr>
        `;
      });

      html += `
              </tbody>
            </table>
          </div>
        </div>
      `;
    });

    scorecardContainer.innerHTML = html;
    this.switchView('scorecard');
  }

  downloadScorecardImage() {
    const element = document.getElementById('scorecard-content');
    if (!element) return;

    if (typeof html2canvas === 'undefined') {
      alert('Image generator library is loading... Please try again in 2 seconds.');
      return;
    }

    const btn = document.getElementById('btn-download-image');
    if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating HD Image...';

    const actionButtons = element.querySelectorAll('.no-print-capture');
    actionButtons.forEach(el => el.style.display = 'none');

    html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#0f172a',
      ignoreElements: (el) => el.classList.contains('no-print-capture')
    }).then(canvas => {
      actionButtons.forEach(el => el.style.display = 'flex');
      const link = document.createElement('a');
      link.download = `Cricket_Scorecard_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      if (btn) btn.innerHTML = '<i class="fa-solid fa-image"></i> Save as Image (PNG)';
    }).catch(err => {
      actionButtons.forEach(el => el.style.display = 'flex');
      console.error('Failed to generate image:', err);
      if (btn) btn.innerHTML = '<i class="fa-solid fa-image"></i> Save as Image (PNG)';
      alert('Failed to generate image scorecard.');
    });
  }

  downloadLiveScoreImage() {
    const element = document.getElementById('live-scorer-container');
    if (!element) return;

    if (typeof html2canvas === 'undefined') {
      alert('Image generator library is loading... Please try again in 2 seconds.');
      return;
    }

    const actionButtons = element.querySelectorAll('.no-print-capture');
    actionButtons.forEach(el => el.style.display = 'none');

    html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#0f172a',
      ignoreElements: (el) => el.classList.contains('no-print-capture')
    }).then(canvas => {
      actionButtons.forEach(el => el.style.display = 'flex');
      const link = document.createElement('a');
      link.download = `Live_Match_Graphic_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }).catch(err => {
      actionButtons.forEach(el => el.style.display = 'flex');
      console.error('Failed to generate live image:', err);
    });
  }

  /* ==========================================================================
     5. POINTS TABLE & STATISTICS COMPUTATIONS
     ========================================================================== */
  getTeamsForActiveTournament() {
    const activeTId = this.state.activeTournamentId;
    return this.state.teams.filter(t => !t.tournamentId || t.tournamentId === activeTId);
  }

  getMatchesForActiveTournament() {
    const activeTId = this.state.activeTournamentId;
    return this.state.matches.filter(m => !m.tournamentId || m.tournamentId === activeTId);
  }

  renderPointsTable() {
    const tbody = document.getElementById('points-table-tbody');
    if (!tbody) return;

    const tournamentTeams = this.getTeamsForActiveTournament();
    const tournamentMatches = this.getMatchesForActiveTournament();

    const standings = tournamentTeams.map(t => {
      let P = 0, W = 0, L = 0, T = 0, NR = 0, Pts = 0;
      let totalRunsScored = 0, totalOversFaced = 0;
      let totalRunsConceded = 0, totalOversBowled = 0;

      tournamentMatches.filter(m => m.status === 'COMPLETED').forEach(m => {
        if (m.teamAId === t.id || m.teamBId === t.id) {
          P++;
          if (m.winnerId === t.id) { W++; Pts += 2; }
          else if (m.winnerId === 'TIE') { T++; Pts += 1; }
          else { L++; }

          (m.innings || []).forEach(inn => {
            if (inn.teamId === t.id) {
              totalRunsScored += inn.runs;
              totalOversFaced += inn.overs;
            } else {
              totalRunsConceded += inn.runs;
              totalOversBowled += inn.overs;
            }
          });
        }
      });

      const nrrScored = totalOversFaced > 0 ? totalRunsScored / totalOversFaced : 0;
      const nrrConceded = totalOversBowled > 0 ? totalRunsConceded / totalOversBowled : 0;
      const nrr = (nrrScored - nrrConceded).toFixed(3);

      return { team: t, P, W, L, T, NR, Pts, nrr: parseFloat(nrr) };
    });

    standings.sort((a, b) => b.Pts - a.Pts || b.nrr - a.nrr);

    let html = '';
    standings.forEach((s, idx) => {
      html += `
        <tr>
          <td style="font-weight: 800;">${idx + 1}</td>
          <td style="font-weight: 800; color: var(--primary);">${s.team.name}</td>
          <td>${s.P}</td>
          <td>${s.W}</td>
          <td>${s.L}</td>
          <td>${s.T}</td>
          <td>${s.NR}</td>
          <td style="font-weight: 900; color: var(--primary); font-size: 1.05rem;">${s.Pts}</td>
          <td style="font-weight: 700; ${s.nrr >= 0 ? 'color: var(--primary);' : 'color: var(--danger);'}">${s.nrr > 0 ? '+' + s.nrr : s.nrr}</td>
        </tr>
      `;
    });

    tbody.innerHTML = html || '<tr><td colspan="9" style="text-align: center;">No team standings available yet.</td></tr>';
  }

  computeAllPlayerStats() {
    const statsMap = {};

    this.state.players.forEach(p => {
      statsMap[p.id] = {
        id: p.id,
        name: p.name,
        teamId: p.teamId,
        role: p.role,
        matches: 0,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        outs: 0,
        fifty: 0,
        hundred: 0,
        highestScore: 0,
        wickets: 0,
        overs: 0,
        runsConceded: 0,
        maidens: 0,
        bestWkts: 0,
        bestRuns: 999,
        potScore: 0
      };
    });

    const tournamentMatches = this.getMatchesForActiveTournament();

    tournamentMatches.filter(m => m.status === 'COMPLETED').forEach(m => {
      (m.innings || []).forEach(inn => {
        (inn.battingScorecard || []).forEach(b => {
          let s = statsMap[b.playerId];
          if (s) {
            s.runs += b.runs;
            s.balls += b.balls;
            s.fours += b.fours;
            s.sixes += b.sixes;
            if (b.isOut) s.outs += 1;
            if (b.runs >= 100) s.hundred += 1;
            else if (b.runs >= 50) s.fifty += 1;
            if (b.runs > s.highestScore) s.highestScore = b.runs;

            s.potScore += (b.runs * 1) + (b.fours * 1) + (b.sixes * 2);
          }
        });

        (inn.bowlingScorecard || []).forEach(bw => {
          let s = statsMap[bw.playerId];
          if (s) {
            s.wickets += bw.wickets;
            s.overs += bw.overs;
            s.runsConceded += bw.runs;
            s.maidens += bw.maidens;

            if (bw.wickets > s.bestWkts || (bw.wickets === s.bestWkts && bw.runs < s.bestRuns)) {
              s.bestWkts = bw.wickets;
              s.bestRuns = bw.runs;
            }

            s.potScore += (bw.wickets * 25) + (bw.maidens * 15);
          }
        });
      });
    });

    return Object.values(statsMap);
  }

  renderStatisticsView() {
    this.renderStats('runs', 10);
    this.renderStats('bowling', 10);
    this.renderCharts();
  }

  renderStats(type, limit) {
    const playerStats = this.computeAllPlayerStats();

    if (type === 'runs') {
      playerStats.sort((a, b) => b.runs - a.runs);
      const tbody = document.getElementById('stats-batting-tbody');
      let html = '';
      playerStats.slice(0, limit).forEach((p, idx) => {
        const team = this.getTeam(p.teamId);
        const avg = p.outs > 0 ? (p.runs / p.outs).toFixed(2) : p.runs.toFixed(2);
        const sr = p.balls > 0 ? ((p.runs / p.balls) * 100).toFixed(1) : '0.0';

        html += `
          <tr>
            <td style="font-weight: 800;">${idx + 1}</td>
            <td style="font-weight: 700; color: var(--primary);">${p.name}</td>
            <td>${team ? team.name : '-'}</td>
            <td>${p.matches || 1}</td>
            <td style="font-weight: 900;">${p.runs}</td>
            <td>${avg}</td>
            <td>${sr}</td>
            <td>${p.fours}</td>
            <td>${p.sixes}</td>
            <td>${p.fifty}</td>
            <td>${p.hundred}</td>
            <td>${p.highestScore}</td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
    } else if (type === 'bowling') {
      playerStats.sort((a, b) => b.wickets - a.wickets || a.runsConceded - b.runsConceded);
      const tbody = document.getElementById('stats-bowling-tbody');
      let html = '';
      playerStats.slice(0, limit).forEach((p, idx) => {
        const team = this.getTeam(p.teamId);
        const econ = p.overs > 0 ? (p.runsConceded / p.overs).toFixed(2) : '0.00';
        const best = p.bestWkts > 0 ? `${p.bestWkts}/${p.bestRuns}` : '-';

        html += `
          <tr>
            <td style="font-weight: 800;">${idx + 1}</td>
            <td style="font-weight: 700; color: var(--accent);">${p.name}</td>
            <td>${team ? team.name : '-'}</td>
            <td>${p.matches || 1}</td>
            <td style="font-weight: 900; color: var(--danger);">${p.wickets}</td>
            <td>${this.formatOvers(p.overs)}</td>
            <td>${p.runsConceded}</td>
            <td>${econ}</td>
            <td>${best}</td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
    }
  }

  renderCharts() {
    const playerStats = this.computeAllPlayerStats();

    // Top 5 Batters Chart
    const top5Batters = playerStats.sort((a, b) => b.runs - a.runs).slice(0, 5);
    const ctxRuns = document.getElementById('chart-top-scorers');
    if (ctxRuns) {
      if (this.charts.runs) this.charts.runs.destroy();
      this.charts.runs = new Chart(ctxRuns, {
        type: 'bar',
        data: {
          labels: top5Batters.map(b => b.name),
          datasets: [{
            label: 'Runs',
            data: top5Batters.map(b => b.runs),
            backgroundColor: '#10b981'
          }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
      });
    }

    // Top 5 Bowlers Chart
    const top5Bowlers = playerStats.sort((a, b) => b.wickets - a.wickets).slice(0, 5);
    const ctxBowlers = document.getElementById('chart-top-bowlers');
    if (ctxBowlers) {
      if (this.charts.bowling) this.charts.bowling.destroy();
      this.charts.bowling = new Chart(ctxBowlers, {
        type: 'bar',
        data: {
          labels: top5Bowlers.map(b => b.name),
          datasets: [{
            label: 'Wickets',
            data: top5Bowlers.map(b => b.wickets),
            backgroundColor: '#3b82f6'
          }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
      });
    }
  }

  renderRecordsView() {
    const playerStats = this.computeAllPlayerStats();

    const highestScore = playerStats.sort((a, b) => b.highestScore - a.highestScore)[0];
    const mostSixes = playerStats.sort((a, b) => b.sixes - a.sixes)[0];
    const mostFours = playerStats.sort((a, b) => b.fours - a.fours)[0];

    const recordsGrid = document.getElementById('records-batting-grid');
    if (recordsGrid) {
      recordsGrid.innerHTML = `
        <div class="stat-card">
          <div class="stat-icon warning"><i class="fa-solid fa-trophy"></i></div>
          <div class="stat-info">
            <div class="stat-value">${highestScore ? highestScore.highestScore : 0}</div>
            <div class="stat-label">Highest Score (${highestScore ? highestScore.name : '-'})</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><i class="fa-solid fa-bolt"></i></div>
          <div class="stat-info">
            <div class="stat-value">${mostSixes ? mostSixes.sixes : 0}</div>
            <div class="stat-label">Most Sixes (${mostSixes ? mostSixes.name : '-'})</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue"><i class="fa-solid fa-layer-group"></i></div>
          <div class="stat-info">
            <div class="stat-value">${mostFours ? mostFours.fours : 0}</div>
            <div class="stat-label">Most Fours (${mostFours ? mostFours.name : '-'})</div>
          </div>
        </div>
      `;
    }
  }

  /* ==========================================================================
     6. TEAMS & PLAYERS MANAGEMENT
     ========================================================================== */
  renderTeamsGrid() {
    const grid = document.getElementById('teams-cards-grid');
    if (!grid) return;

    const availableTeams = this.getTeamsForActiveTournament();

    let html = '';
    availableTeams.forEach(t => {
      const squadCount = this.getPlayersByTeam(t.id).length;
      html += `
        <div class="card" style="border-top: 4px solid ${t.color || '#10b981'};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <h3 style="font-weight: 800;">${t.name}</h3>
            <span class="badge badge-completed">${squadCount} Players</span>
          </div>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem;">Coach: ${t.coach || 'N/A'}</p>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" onclick="app.openTeamModal('${t.id}')"><i class="fa-solid fa-pen"></i> Edit</button>
            <button class="btn btn-primary btn-sm" onclick="app.openQuickPlayerModal('${t.id}')"><i class="fa-solid fa-user-plus"></i> + Add Player</button>
            <button class="btn btn-danger btn-sm" onclick="app.deleteTeam('${t.id}')"><i class="fa-solid fa-trash"></i> Delete</button>
          </div>
        </div>
      `;
    });
    grid.innerHTML = html || '<p style="color: var(--text-muted);">No teams created in this tournament yet.</p>';
  }

  openTeamModal(teamId = null) {
    document.getElementById('team-edit-id').value = teamId || '';
    if (teamId) {
      const team = this.getTeam(teamId);
      document.getElementById('team-name').value = team.name;
      document.getElementById('team-coach').value = team.coach || '';
      document.getElementById('team-color').value = team.color || '#10b981';
      document.getElementById('team-modal-title').textContent = 'Edit Team';
    } else {
      document.getElementById('team-form').reset();
      document.getElementById('team-modal-title').textContent = 'Create New Team';
    }
    document.getElementById('modal-team').classList.add('active');
  }

  submitTeam(e) {
    e.preventDefault();
    const id = document.getElementById('team-edit-id').value;
    const name = document.getElementById('team-name').value;
    const coach = document.getElementById('team-coach').value;
    const color = document.getElementById('team-color').value;

    const activeT = this.getActiveTournament();

    if (id) {
      const team = this.getTeam(id);
      team.name = name;
      team.coach = coach;
      team.color = color;
    } else {
      this.state.teams.push({ id: 't_' + Date.now(), tournamentId: activeT.id, name, coach, color });
    }

    this.saveState();
    this.closeModal('modal-team');
    this.renderTeamsGrid();
    this.renderDashboard();
  }

  deleteTeam(id) {
    if (confirm('Delete this team and its players?')) {
      this.state.teams = this.state.teams.filter(t => t.id !== id);
      this.state.players = this.state.players.filter(p => p.teamId !== id);
      this.saveState();
      this.renderTeamsGrid();
      this.renderDashboard();
    }
  }

  renderPlayersList() {
    const tbody = document.getElementById('players-table-tbody');
    const teamFilter = document.getElementById('players-filter-team');

    const availableTeams = this.getTeamsForActiveTournament();

    let filterOptions = '<option value="ALL">All Teams</option>';
    availableTeams.forEach(t => {
      filterOptions += `<option value="${t.id}">${t.name}</option>`;
    });
    if (teamFilter) teamFilter.innerHTML = filterOptions;

    const searchVal = (document.getElementById('players-filter-search')?.value || '').toLowerCase();
    const selectedTeam = teamFilter?.value || 'ALL';

    const playerStats = this.computeAllPlayerStats();

    let html = '';
    playerStats.forEach(p => {
      const team = this.getTeam(p.teamId);
      if (selectedTeam !== 'ALL' && p.teamId !== selectedTeam) return;
      if (searchVal && !p.name.toLowerCase().includes(searchVal)) return;

      html += `
        <tr>
          <td style="font-weight: 700; color: var(--primary);">${p.name}</td>
          <td>${team ? team.name : '-'}</td>
          <td><span class="badge badge-upcoming">${p.role}</span></td>
          <td>#${p.jersey || '-'}</td>
          <td style="font-weight: 800;">${p.runs}</td>
          <td style="font-weight: 800; color: var(--danger);">${p.wickets}</td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="app.openPlayerModal('${p.id}')"><i class="fa-solid fa-pen"></i></button>
            <button class="btn btn-danger btn-sm" onclick="app.deletePlayer('${p.id}')"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = html || '<tr><td colspan="7" style="text-align: center;">No players found.</td></tr>';
  }

  openPlayerModal(playerId = null) {
    const teamSelect = document.getElementById('player-team');
    const availableTeams = this.getTeamsForActiveTournament();

    let teamOpts = '';
    availableTeams.forEach(t => {
      teamOpts += `<option value="${t.id}">${t.name}</option>`;
    });
    teamSelect.innerHTML = teamOpts;

    document.getElementById('player-edit-id').value = playerId || '';
    if (playerId) {
      const p = this.getPlayer(playerId);
      document.getElementById('player-name').value = p.name;
      document.getElementById('player-team').value = p.teamId;
      document.getElementById('player-jersey').value = p.jersey || '';
      document.getElementById('player-role').value = p.role;
      document.getElementById('player-modal-title').textContent = 'Edit Player';
    } else {
      document.getElementById('player-form').reset();
      document.getElementById('player-modal-title').textContent = 'Add Player';
    }
    document.getElementById('modal-player').classList.add('active');
  }

  submitPlayer(e) {
    e.preventDefault();
    const id = document.getElementById('player-edit-id').value;
    const name = document.getElementById('player-name').value;
    const teamId = document.getElementById('player-team').value;
    const jersey = parseInt(document.getElementById('player-jersey').value) || 0;
    const role = document.getElementById('player-role').value;

    if (id) {
      const p = this.getPlayer(id);
      p.name = name; p.teamId = teamId; p.jersey = jersey; p.role = role;
    } else {
      this.state.players.push({ id: 'p_' + Date.now(), name, teamId, jersey, role });
    }

    this.saveState();
    this.closeModal('modal-player');
    this.renderPlayersList();
  }

  deletePlayer(id) {
    if (confirm('Delete player?')) {
      this.state.players = this.state.players.filter(p => p.id !== id);
      this.saveState();
      this.renderPlayersList();
    }
  }

  renderMatchesList() {
    const container = document.getElementById('matches-cards-list');
    if (!container) return;

    const availableMatches = this.getMatchesForActiveTournament();

    let html = '';
    availableMatches.forEach(m => {
      const teamA = this.getTeam(m.teamAId);
      const teamB = this.getTeam(m.teamBId);
      const inn1 = m.innings ? m.innings[0] : null;
      const inn2 = m.innings ? m.innings[1] : null;

      html += `
        <div class="card" style="margin-bottom: 0.75rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
            <div>
              <span class="badge ${m.status === 'LIVE' ? 'badge-live' : 'badge-completed'}">${m.status}</span>
              <h3 style="font-weight: 800; margin-top: 0.3rem;">${m.matchNumber}: ${teamA ? teamA.name : 'Team A'} vs ${teamB ? teamB.name : 'Team B'}</h3>
              <p style="color: var(--text-muted); font-size: 0.85rem;">${m.venue} | ${m.date}</p>
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              ${m.status === 'LIVE' ? `<button class="btn btn-primary btn-sm" onclick="app.switchView('live-scorer')">Resume Live</button>` : ''}
              <button class="btn btn-secondary btn-sm" onclick="app.viewScorecard('${m.id}')">View Scorecard</button>
            </div>
          </div>
          <div style="margin-top: 0.75rem; font-weight: 700; color: var(--primary);">
            ${m.resultSummary || 'Match Scheduled'}
          </div>
        </div>
      `;
    });
    container.innerHTML = html || '<p style="color: var(--text-muted);">No matches recorded for this tournament.</p>';
  }

  renderKnockoutView() {
    const container = document.getElementById('knockout-bracket-container');
    const finalSummary = document.getElementById('tournament-final-summary');

    const activeT = this.getActiveTournament();
    const tournamentMatches = this.getMatchesForActiveTournament();
    const playerStats = this.computeAllPlayerStats();
    const topPlayer = playerStats.sort((a, b) => b.potScore - a.potScore)[0];

    const knockoutStages = ['Qualifier 1', 'Eliminator', 'Qualifier 2', 'Final'];
    const playoffMatches = tournamentMatches.filter(m => knockoutStages.includes(m.stage));

    if (container) {
      if (playoffMatches.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 2rem; color: var(--text-muted); width: 100%;">
            <i class="fa-solid fa-sitemap" style="font-size: 2.5rem; margin-bottom: 0.75rem; color: var(--border-highlight);"></i>
            <h4>No Playoff / Knockout Matches Played Yet</h4>
            <p style="font-size: 0.85rem; margin-top: 0.3rem;">When creating a match, set stage to 'Qualifier 1', 'Eliminator', 'Qualifier 2', or 'Final' to display in this playoff bracket.</p>
          </div>
        `;
      } else {
        let html = '';
        knockoutStages.forEach(stageName => {
          const match = playoffMatches.find(m => m.stage === stageName);
          if (match) {
            const teamA = this.getTeam(match.teamAId);
            const teamB = this.getTeam(match.teamBId);
            const inn1 = match.innings ? match.innings[0] : null;
            const inn2 = match.innings ? match.innings[1] : null;

            const isTeamAWinner = match.winnerId === match.teamAId;
            const isTeamBWinner = match.winnerId === match.teamBId;

            html += `
              <div class="bracket-round">
                <h4 style="color: var(--primary);">${stageName}</h4>
                <div class="bracket-match" ${stageName === 'Final' ? 'style="border-color: var(--warning);"' : ''}>
                  <div class="bracket-team ${isTeamAWinner ? 'winner' : ''}">
                    <span>${teamA ? teamA.name : 'Team A'}</span>
                    <span>${inn1 ? inn1.runs + '/' + inn1.wickets : '-'}</span>
                  </div>
                  <div class="bracket-team ${isTeamBWinner ? 'winner' : ''}">
                    <span>${teamB ? teamB.name : 'Team B'}</span>
                    <span>${inn2 ? inn2.runs + '/' + inn2.wickets : '-'}</span>
                  </div>
                </div>
              </div>
            `;
          }
        });
        container.innerHTML = html || `<p style="color: var(--text-muted); text-align: center; padding: 1.5rem;">No knockout matches found.</p>`;
      }
    }

    if (finalSummary) {
      const finalMatch = tournamentMatches.find(m => m.stage === 'Final' && m.status === 'COMPLETED');
      if (finalMatch) {
        const champTeam = this.getTeam(finalMatch.winnerId);
        const runnerTeamId = finalMatch.winnerId === finalMatch.teamAId ? finalMatch.teamBId : finalMatch.teamAId;
        const runnerTeam = this.getTeam(runnerTeamId);

        finalSummary.innerHTML = `
          <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
            <div>
              <h3>🏆 CHAMPION: ${champTeam ? champTeam.name : 'Team'}</h3>
              <p style="color: var(--text-muted);">Winner of ${activeT ? activeT.name : 'Tournament'}</p>
            </div>
            <div>
              <h3>🥈 RUNNER-UP: ${runnerTeam ? runnerTeam.name : 'Team'}</h3>
              <p style="color: var(--text-muted);">Playoff Finalist</p>
            </div>
            <div>
              <h3>⭐ PLAYER OF TOURNAMENT: ${topPlayer ? topPlayer.name : 'N/A'}</h3>
              <p style="color: var(--text-muted);">Highest Tournament Points & Performance</p>
            </div>
          </div>
        `;
      } else {
        finalSummary.innerHTML = `
          <div style="color: var(--text-muted); font-size: 0.9rem;">
            <i class="fa-solid fa-crown" style="color: var(--warning);"></i> <strong>${activeT ? activeT.name : 'Tournament'}</strong> — Final match not completed yet. Play & complete the Final match to declare the official Champion!
          </div>
        `;
      }
    }
  }

  populateSetupForm() {
    const t = this.getActiveTournament();
    if (t) {
      document.getElementById('setup-name').value = t.name || '';
      document.getElementById('setup-season').value = t.season || '2026';
      document.getElementById('setup-location').value = t.location || '';
      document.getElementById('setup-start-date').value = t.startDate || '';
      document.getElementById('setup-end-date').value = t.endDate || '';
      document.getElementById('setup-format').value = t.format || 'League + Knockout';
    }
  }

  exportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `cricket_tournament_backup_${Date.now()}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  }

  importData() {
    const fileInput = document.getElementById('import-json-file');
    if (!fileInput.files[0]) {
      alert('Please select a JSON file to import.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported.teams && (imported.tournament || imported.tournaments)) {
          this.state = imported;
          this.saveState();
          this.renderAll();
          alert('Tournament data restored successfully!');
        } else {
          alert('Invalid backup JSON format.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(fileInput.files[0]);
  }

  confirmResetData() {
    if (confirm('CAUTION: Are you sure you want to delete ALL tournament data? This action cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    }
  }

  handleGlobalSearch(query) {
    if (!query || query.length < 2) return;
    const q = query.toLowerCase();
    const matchingPlayers = this.state.players.filter(p => p.name.toLowerCase().includes(q));
    const matchingTeams = this.state.teams.filter(t => t.name.toLowerCase().includes(q));

    if (matchingPlayers.length > 0) {
      this.switchView('players');
      document.getElementById('players-filter-search').value = query;
      this.renderPlayersList();
    } else if (matchingTeams.length > 0) {
      this.switchView('teams');
    }
  }

  /* Helper Functions */
  getTeam(id) { return this.state.teams.find(t => t.id === id); }
  getPlayer(id) { return this.state.players.find(p => p.id === id); }
  getPlayersByTeam(teamId) { return this.state.players.filter(p => p.teamId === teamId); }

  formatOvers(overs) {
    return overs.toFixed(1);
  }

  calculateCRR(runs, overs) {
    if (overs <= 0) return '0.00';
    const totalBalls = Math.floor(overs) * 6 + Math.round((overs % 1) * 10);
    if (totalBalls === 0) return '0.00';
    return ((runs / totalBalls) * 6).toFixed(2);
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }
}

// Global Application Instance
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new CricketApp();
});
