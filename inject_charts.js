const fs = require('fs');
const path = require('path');

const targetHtml = 'D:/Traffic/Metro/output/conclusion/transit_infographics.html';
let content = fs.readFileSync(targetHtml, 'utf8');

const insertionSnippet = `
    <!-- DUAL ANALYSIS CONTRAST (CLEAN DATA vs ALL RAW DATA) -->
    <div class="glass-card rounded-2xl p-6 md:p-8 space-y-6 border border-emerald-500/30">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-800 pb-4">
        <div>
          <span class="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold text-xs uppercase tracking-wider border border-emerald-500/30">Rigorous Dual Analysis</span>
          <h2 class="text-2xl font-black text-white mt-1">Clean (Correct) Data vs All Raw Data (With Anomalies)</h2>
          <p class="text-xs text-slate-400">Directly measuring the statistical distortion caused by Google Maps walking fallbacks and closed Sunday schedules.</p>
        </div>
        <span class="text-xs font-mono text-slate-300 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg">N = 1,952 (Clean) vs 2,300 (Raw)</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- ANALYSIS A: CLEAN -->
        <div class="p-5 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-4">
          <div class="flex justify-between items-center text-emerald-400 font-bold">
            <span class="flex items-center gap-2 text-base"><span>✅</span> Analysis A: Clean / Correct Data</span>
            <span class="text-xs px-2 py-0.5 rounded bg-emerald-500/20">Zero Anomalies</span>
          </div>
          <p class="text-xs text-slate-300">Quarantines all 169 walking fallbacks and 179 closed Sunday runs. Reflects true train operations.</p>
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div class="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
              <span class="text-slate-400 block text-[11px]">Metro Win Rate vs Bus</span>
              <span class="text-2xl font-black text-emerald-400">99.0%</span>
              <span class="text-[10px] text-slate-400 block">(1,932 / 1,952 trips)</span>
            </div>
            <div class="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
              <span class="text-slate-400 block text-[11px]">Average Time Saved</span>
              <span class="text-2xl font-black text-emerald-300">+11.4 min</span>
              <span class="text-[10px] text-slate-400 block">per one-way journey</span>
            </div>
            <div class="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
              <span class="text-slate-400 block text-[11px]">Metro Mean Duration</span>
              <span class="text-2xl font-black text-cyan-400">16.6 min</span>
              <span class="text-[10px] text-slate-400 block">Standard Dev: ±7.4m</span>
            </div>
            <div class="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
              <span class="text-slate-400 block text-[11px]">Purple Line Win Rate</span>
              <span class="text-2xl font-black text-purple-400">82.0%</span>
              <span class="text-[10px] text-emerald-400 block">9.5m Metro vs 14.3m Bus</span>
            </div>
          </div>
        </div>

        <!-- ANALYSIS B: RAW ALL DATA -->
        <div class="p-5 rounded-xl bg-rose-950/20 border border-rose-500/40 space-y-4">
          <div class="flex justify-between items-center text-rose-400 font-bold">
            <span class="flex items-center gap-2 text-base"><span>⚠️</span> Analysis B: All Raw Data</span>
            <span class="text-xs px-2 py-0.5 rounded bg-rose-500/20">Contains Anomalies</span>
          </div>
          <p class="text-xs text-slate-300">Includes 348 distorted runs (walking 57 mins on highway, Sunday closures counted as bus wins).</p>
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div class="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
              <span class="text-slate-400 block text-[11px]">Metro Win Rate vs Bus</span>
              <span class="text-2xl font-black text-rose-400">84.4%</span>
              <span class="text-[10px] text-rose-400 block">(-14.6% artificial penalty)</span>
            </div>
            <div class="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
              <span class="text-slate-400 block text-[11px]">Average Time Saved</span>
              <span class="text-2xl font-black text-slate-300">+8.6 min</span>
              <span class="text-[10px] text-rose-400 block">(-2.8 min depressed)</span>
            </div>
            <div class="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
              <span class="text-slate-400 block text-[11px]">Metro Mean Duration</span>
              <span class="text-2xl font-black text-amber-300">18.6 min</span>
              <span class="text-[10px] text-rose-400 block">Standard Dev: ±10.8m (+46% noise)</span>
            </div>
            <div class="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
              <span class="text-slate-400 block text-[11px]">Purple Line Win Rate</span>
              <span class="text-2xl font-black text-rose-500">41.2%</span>
              <span class="text-[10px] text-rose-400 block">Severely broken by walk fallback</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- BUS SPEED VS ALL DAYS OF THE WEEK CHART -->
    <div class="glass-card rounded-2xl p-6 md:p-8 space-y-6 border border-orange-500/30">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-800 pb-4">
        <div>
          <span class="px-2.5 py-1 rounded bg-orange-500/20 text-orange-400 font-bold text-xs uppercase tracking-wider border border-orange-500/30">Weekly Temporal Dynamics</span>
          <h2 class="text-2xl font-black text-white mt-1">Bus Speed vs All Days of the Week (Mon – Sun)</h2>
          <p class="text-xs text-slate-400">Commercial bus operating velocities across all 25 corridors and 4 diurnal time slots.</p>
        </div>
        <span class="text-xs font-mono text-orange-400 bg-orange-950/60 border border-orange-800 px-3 py-1.5 rounded-lg">Network Average: 18.5 km/h</span>
      </div>

      <!-- VISUAL BAR / SPEED GRAPH -->
      <div class="space-y-4 pt-2">
        <div class="grid grid-cols-7 gap-2 md:gap-3 text-center text-xs">
          <!-- Mon -->
          <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-orange-500/50 transition">
            <span class="text-slate-400 font-bold block mb-1">MON</span>
            <div class="h-28 flex items-end justify-center py-1">
              <div class="w-8 grad-bus rounded-t-lg relative group" style="height: 74%;">
                <span class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-orange-300">18.6</span>
              </div>
            </div>
            <span class="text-[11px] font-bold text-white block mt-1">18.6 km/h</span>
            <span class="text-[10px] text-slate-500">10 AM: 18.7</span>
          </div>

          <!-- Tue -->
          <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-orange-500/50 transition">
            <span class="text-slate-400 font-bold block mb-1">TUE</span>
            <div class="h-28 flex items-end justify-center py-1">
              <div class="w-8 grad-bus rounded-t-lg relative group" style="height: 72%;">
                <span class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-orange-300">18.4</span>
              </div>
            </div>
            <span class="text-[11px] font-bold text-white block mt-1">18.4 km/h</span>
            <span class="text-[10px] text-slate-500">10 AM: 18.7</span>
          </div>

          <!-- Wed -->
          <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-orange-500/50 transition">
            <span class="text-slate-400 font-bold block mb-1">WED</span>
            <div class="h-28 flex items-end justify-center py-1">
              <div class="w-8 grad-bus rounded-t-lg relative group" style="height: 73%;">
                <span class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-orange-300">18.5</span>
              </div>
            </div>
            <span class="text-[11px] font-bold text-white block mt-1">18.5 km/h</span>
            <span class="text-[10px] text-slate-500">10 AM: 18.7</span>
          </div>

          <!-- Thu -->
          <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-orange-500/50 transition">
            <span class="text-slate-400 font-bold block mb-1">THU</span>
            <div class="h-28 flex items-end justify-center py-1">
              <div class="w-8 grad-bus rounded-t-lg relative group" style="height: 73%;">
                <span class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-orange-300">18.5</span>
              </div>
            </div>
            <span class="text-[11px] font-bold text-white block mt-1">18.5 km/h</span>
            <span class="text-[10px] text-slate-500">10 AM: 18.7</span>
          </div>

          <!-- Fri -->
          <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-orange-500/50 transition">
            <span class="text-slate-400 font-bold block mb-1">FRI</span>
            <div class="h-28 flex items-end justify-center py-1">
              <div class="w-8 grad-bus rounded-t-lg relative group" style="height: 73%;">
                <span class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-orange-300">18.5</span>
              </div>
            </div>
            <span class="text-[11px] font-bold text-white block mt-1">18.5 km/h</span>
            <span class="text-[10px] text-slate-500">10 AM: 18.7</span>
          </div>

          <!-- Sat -->
          <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-orange-500/50 transition">
            <span class="text-slate-400 font-bold block mb-1">SAT</span>
            <div class="h-28 flex items-end justify-center py-1">
              <div class="w-8 grad-bus rounded-t-lg relative group" style="height: 73%;">
                <span class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-orange-300">18.5</span>
              </div>
            </div>
            <span class="text-[11px] font-bold text-white block mt-1">18.5 km/h</span>
            <span class="text-[10px] text-slate-500">10 AM: 18.7</span>
          </div>

          <!-- Sun -->
          <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-orange-500/50 transition">
            <span class="text-slate-400 font-bold block mb-1">SUN</span>
            <div class="h-28 flex items-end justify-center py-1">
              <div class="w-8 grad-bus rounded-t-lg relative group" style="height: 73%;">
                <span class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-orange-300">18.5</span>
              </div>
            </div>
            <span class="text-[11px] font-bold text-white block mt-1">18.5 km/h</span>
            <span class="text-[10px] text-slate-500">10 AM: 18.7</span>
          </div>
        </div>

        <!-- Corridor Breakdown Pills -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 text-xs">
          <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <span class="text-slate-400 block text-[11px]">Slowest Bus Corridors (&lt; 15 km/h)</span>
            <p class="font-bold text-rose-400 mt-1">• MC-01 (BT Road / Dunlop): 14.7 km/h</p>
            <p class="font-bold text-rose-400">• MC-04 (Shyambazar / Esplanade): 14.8 km/h</p>
          </div>
          <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <span class="text-slate-400 block text-[11px]">Moderate Arterials (16 - 19 km/h)</span>
            <p class="font-bold text-amber-300 mt-1">• MC-10 (Howrah Bridge): 17.3 km/h</p>
            <p class="font-bold text-amber-300">• MC-02 (SP Mukherjee Rd): 17.8 km/h</p>
          </div>
          <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <span class="text-slate-400 block text-[11px]">Fastest Radial Corridors (&gt; 20 km/h)</span>
            <p class="font-bold text-emerald-400 mt-1">• MC-19 (Diamond Harbour Rd): 23.3 km/h</p>
            <p class="font-bold text-emerald-400">• MC-22 (Joka / Taratala): 21.8 km/h</p>
          </div>
        </div>
      </div>
    </div>
`;

// Insert before '<!-- COMPARATIVE HEAD-TO-HEAD RANKINGS TABLE -->'
content = content.replace('<!-- COMPARATIVE HEAD-TO-HEAD RANKINGS TABLE -->', insertionSnippet + '\n    <!-- COMPARATIVE HEAD-TO-HEAD RANKINGS TABLE -->');
fs.writeFileSync(targetHtml, content, 'utf8');
fs.writeFileSync('C:/Users/ACER/.gemini/antigravity/brain/f576e7cd-b43a-4973-849b-307016f95d1a/transit_infographics.html', content, 'utf8');
console.log('Successfully updated transit_infographics.html with Dual Analysis and Day-of-Week Bus Speed chart!');
