import { Component, OnInit, signal, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterOutlet, RouterLink, Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";
import { MenuItem, MessageService } from "primeng/api";
import { TranslocoModule, TranslocoService } from "@jsverse/transloco";
import { HeaderComponent } from "./components/header/header.component";
import { ToastModule } from "primeng/toast";
import { DataUpdatedService } from "./services/data-updated.service";
import { AchievementService } from "./services/achievement.service";
import { RecordSubstanceUseComponent } from "./components/substance/record-substance-use.component";
import { AlternativeActivityOverlayComponent } from "./components/alternative-activity/alternative-activity-overlay.component";
import { SubstanceService } from "./services/substance.service";
import { SubstanceDto } from "./dto/substance.dto";
import {
    SobrietyCardComponent,
    SobrietyCardStyle,
} from "./components/sobriety/sobriety-card.component";
import { AddRecordButtonComponent } from "./components/add-record-button/add-record-button.component";
import { VersionComponent } from './version/version.component';
import { ThemeService } from "./services/theme.service";
import { AuthService } from "./services/auth.service";
import { CookieService } from "ngx-cookie-service";

@Component({
    selector: "app-root",
    standalone: true,
    imports: [
        RouterOutlet,
        TranslocoModule,
        CommonModule,
        HeaderComponent,
        ToastModule,
        RecordSubstanceUseComponent,
        AlternativeActivityOverlayComponent,
        SobrietyCardComponent,
        AddRecordButtonComponent,
        VersionComponent
    ],
    providers: [CookieService, RouterLink, MessageService],
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
    private themeService = inject(ThemeService);
    private translateService = inject(TranslocoService);
    private router = inject(Router);
    private dataUpdatedService = inject(DataUpdatedService);
    private achievementService = inject(AchievementService);
    private substanceService = inject(SubstanceService);
    private authService = inject(AuthService);
    private messageService = inject(MessageService);

    title = "SoberVerse";
    menuItems!: MenuItem[];

    showBreathingPrompt = false;
    showAddSubstance = false;
    showRecordPopup = false;
    showMotivationalFactors = false;
    currentMotivationalFactor: any = null;

    substances = signal<SubstanceDto[]>([]);
    selectedSubstance!: SubstanceDto;

    alternativeActivities: any[] = [
        { id: 1, name: "Breathing Exercise", count: 0, successCount: 0, failCount: 0 },
        { id: 2, name: "Drink Water", count: 0, successCount: 0, failCount: 0 },
        { id: 3, name: "Take a Walk", count: 0, successCount: 0, failCount: 0 },
        { id: 4, name: "Stretching", count: 0, successCount: 0, failCount: 0 },
        { id: 5, name: "Healthy Snack", count: 0, successCount: 0, failCount: 0 },
        { id: 6, name: "Call a Friend", count: 0, successCount: 0, failCount: 0 },
    ];

    currentActivity: any = null;
    sobrietyComponentStyle = SobrietyCardStyle.BADGE;
    showPrivacyOverlay = signal(false);
    private substancesLoaded = false;

    constructor() {
        this.translateService.setDefaultLang("en");
        const userLanguage = localStorage.getItem("language") || "en";
        this.translateService.setActiveLang(userLanguage);
    }

    ngOnInit(): void {
        // Attempt Tauri integration only if available
        const win = globalThis.window as any;
        if (win?.__TAURI_INTERNALS__?.invoke) {
            try { win.__TAURI_INTERNALS__.invoke("set_frontend_complete"); } catch { /* ignore */ }
        }

        // Setup theme
        const currentTheme = this.themeService.getCurrentTheme()();
        const userTheme = localStorage.getItem("theme") || currentTheme;
        if (userTheme !== currentTheme) {
            this.themeService.switchTheme();
        }

        // Achievement detection on data changes
        const detectAchievements = () => {
            if (this.authService.isAuthenticated()) {
                this.achievementService.detectAchievements();
            }
        };
        this.dataUpdatedService.subscribe("cost", detectAchievements);
        this.dataUpdatedService.subscribe("usage", detectAchievements);
        this.dataUpdatedService.subscribe("motivational_factor", detectAchievements);
        this.dataUpdatedService.subscribe("usage_filling", detectAchievements);

        // Load substances only after successful navigation to authenticated routes
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: any) => {
            const url: string = event.urlAfterRedirects || event.url;
            if (!url.startsWith('/login') && this.authService.isAuthenticated() && !this.substancesLoaded) {
                this.loadSubstances();
            }
        });

        // Also try on init if already authenticated and not on login
        if (this.authService.isAuthenticated()) {
            detectAchievements();
            setTimeout(() => {
                if (!this.router.url.startsWith('/login')) {
                    this.loadSubstances();
                }
            }, 500);
        }
    }

    private loadSubstances(): void {
        this.substancesLoaded = true;
        this.substanceService.getActiveSubstances().then((substances) => {
            this.substances.set(substances as SubstanceDto[]);
            if (!substances.length) {
                this.showAddSubstance = true;
                this.showRecordPopup = true;
            }
        });
    }

    switchTheme() {
        this.themeService.switchTheme();
        const currentTheme = this.themeService.getCurrentTheme()();
        localStorage.setItem("theme", currentTheme);
    }

    switchLanguage(language: "en") {
        this.translateService.setActiveLang(language);
        localStorage.setItem("language", language);
    }

    get isDarkMode() {
        return this.themeService.getCurrentTheme()() === "dark";
    }

    get isOnLoginPage(): boolean {
        return this.router.url.startsWith('/login');
    }

    setShowRecordPopup(val: boolean) { this.showRecordPopup = val; }
    setShowMotivationalFactors(val: boolean) { this.showMotivationalFactors = val; }
    onAddRecordClick() { this.showRecordPopup = true; }

    handleAddSubstance(substance: SubstanceDto) {
        const substances = this.substances();
        substances.push(substance);
        this.substances.set([...substances]);
    }

    handleAlternativeSelected(activityId: number) {
        const selectedActivity = this.alternativeActivities.find((alt) => alt.id === activityId);
        if (!selectedActivity) return;
        const activityIndex = this.alternativeActivities.findIndex((a) => a.id === activityId);
        if (activityIndex >= 0) {
            this.alternativeActivities[activityIndex] = {
                ...this.alternativeActivities[activityIndex],
                count: this.alternativeActivities[activityIndex].count + 1,
            };
        }
        this.currentActivity = { id: selectedActivity.id, name: selectedActivity.name };
    }

    handleAlternativeFeedback(activity: any, wasSuccessful: boolean, _feedback?: string): void {
        if (!activity) return;
        const activityIndex = this.alternativeActivities.findIndex((a) => a.id === activity.id);
        if (activityIndex >= 0) {
            const updatedActivity = {
                ...this.alternativeActivities[activityIndex],
                successCount: wasSuccessful
                    ? this.alternativeActivities[activityIndex].successCount + 1
                    : this.alternativeActivities[activityIndex].successCount,
                failCount: !wasSuccessful
                    ? this.alternativeActivities[activityIndex].failCount + 1
                    : this.alternativeActivities[activityIndex].failCount,
            };
            this.alternativeActivities[activityIndex] = updatedActivity;
        }
        this.showBreathingPrompt = false;
    }

    handleMotivationalFeedback(_feedback: any) { /* ... */ }
    handleSubmit() { /* ... */ }

    handleSelectSubstance(substance: SubstanceDto) {
        this.selectedSubstance = substance;
    }

    handleGiveUpUsage() {
        this.showRecordPopup = false;
        this.showBreathingPrompt = false;
        this.messageService.add({
            severity: "success",
            summary: "Congratulations for this decision",
            detail: "This is an important step for your recovery",
            life: 3000,
        });
    }
}
