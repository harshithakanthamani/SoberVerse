import { Routes } from "@angular/router";
import { HomeComponent } from "./pages/home/home.component";
import { LoginComponent } from "./pages/login/login.component";
import { authGuard } from "./guards/auth.guard";

export const routes: Routes = [
    { path: "login", component: LoginComponent },
    { path: "", component: HomeComponent, canActivate: [authGuard] },
    { 
        path: "usage-entries", 
        canActivate: [authGuard],
        loadComponent: () =>
            import("./pages/usage-entries/usage-entries.component").then(
                (comp) => comp.UsageEntriesComponent,
            ),
    },
    { 
        path: "motivational-factors", 
        canActivate: [authGuard],
        loadComponent: () =>
            import("./pages/motivational-factors/motivational-factors.component").then(
                (comp) => comp.MotivationalFactorsComponent,
            ),
    },
    { 
        path: "recovery-dashboard", 
        canActivate: [authGuard],
        loadComponent: () =>
            import("./pages/recovery-dashboard/recovery-dashboard.component").then(
                (comp) => comp.RecoveryDashboardComponent,
            ),
    },
    { 
        path: "achievements", 
        canActivate: [authGuard],
        loadComponent: () =>
            import("./pages/achievements/achievements.component").then(
                (comp) => comp.AchievementsComponent,
            ),
    },
    { 
        path: "alternative-activity-analytics", 
        canActivate: [authGuard],
        loadComponent: () =>
            import("./pages/alternative-activity-analytics/alternative-activity-analytics.component").then(
                (comp) => comp.AlternativeActivityAnalyticsComponent,
            ),
    },
    { 
        path: "financial-impact", 
        canActivate: [authGuard],
        loadComponent: () =>
            import("./pages/financial-impact/financial-impact.component").then(
                (comp) => comp.FinancialImpactComponent,
            ),
    },
    { 
        path: "triggers", 
        canActivate: [authGuard],
        loadComponent: () =>
            import("./pages/triggers/triggers.component").then(
                (comp) => comp.TriggersComponent,
            ),
    },
    { 
        path: "settings", 
        canActivate: [authGuard],
        loadComponent: () =>
            import("./pages/settings/settings.component").then(
                (comp) => comp.SettingsComponent,
            ),
    },
    { 
        path: "substances", 
        canActivate: [authGuard],
        loadComponent: () =>
            import("./pages/substances/substances.component").then(
                (comp) => comp.SubstancesComponent,
            ),
    },
    { 
        path: "triggers/management", 
        canActivate: [authGuard],
        loadComponent: () =>
            import("./pages/triggers/trigger_management.component").then(
                (comp) => comp.TriggerManagementComponent,
            ),
    },
    { 
        path: "settings/backup", 
        canActivate: [authGuard],
        loadComponent: () =>
            import("./pages/backup/backup.component").then(
                (comp) => comp.BackupComponent,
            ),
    },
    { 
        path: "settings/sync", 
        canActivate: [authGuard],
        loadComponent: () =>
            import("./pages/synchronization/synchronization.component").then(
                (comp) => comp.SynchronizationComponent,
            ),
    },
    { 
        path: "about", 
        canActivate: [authGuard],
        loadComponent: () =>
            import("./version/version.component").then(
                (comp) => comp.VersionComponent,
            ),
    },
    {
        path: "license",
        canActivate: [authGuard],
        loadComponent: () =>
        import("./license/license.component").then(
            (comp) => comp.LicenseComponent,
        ),
    },
];
