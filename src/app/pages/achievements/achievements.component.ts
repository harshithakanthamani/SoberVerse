import { CommonModule } from "@angular/common";
import { Component, computed, OnInit, signal, inject } from "@angular/core";
import { AchievementsDisplayComponent } from "../../components/achivements/achievements-display.component";
import { AchievementDto, SafeIconAchievement } from "../../dto/achievement.dto";
import { AchievementService } from "../../services/achievement.service";
import { DataUpdatedService } from "../../services/data-updated.service";
import { TranslocoModule } from "@jsverse/transloco";

@Component({
    selector: "app-achievements",
    standalone: true,
    imports: [CommonModule, AchievementsDisplayComponent, TranslocoModule],
    templateUrl: "./achievements.component.html",
})
export class AchievementsComponent implements OnInit {
    private achievementService = inject(AchievementService);
    private dataUpdatedService = inject(DataUpdatedService);

    achievements = signal<AchievementDto[]>([]);
    loading = true;

    saferAchievements = this.achievementService.getAchievementsWithIcon(this.achievements);

    achievementUncompleted = computed<SafeIconAchievement[]>(() => {
        const uncompleted = this.saferAchievements.value()?.filter((a) => !a.completed) ?? [];
        return uncompleted
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value)
            .slice(0, 3) as SafeIconAchievement[];
    });

    ngOnInit() {
        this.loadAchievements();
        // Reload whenever an achievement is updated
        this.dataUpdatedService.subscribe('achievement', () => {
            this.loadAchievements();
        });
    }

    loadAchievements() {
        this.loading = true;
        this.achievementService.list().then((achievements) => {
            this.achievements.set(achievements as AchievementDto[]);
            this.loading = false;
        });
    }

    getIconForCategory(category: string): string {
        switch (category) {
            case "sobriety": return "✔️";
            case "alternatives": return "💡";
            case "motivational": return "❤️";
            case "financial": return "💰";
            case "engagement":
            default: return "📘";
        }
    }
}
