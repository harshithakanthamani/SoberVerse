import { CommonModule } from "@angular/common";
import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { UsageFillingService } from "../../services/usage-filling.service";
import { UsageFillingAddDto } from "../../dto/usage-filling.dto";
import { SubstanceDto } from "../../dto/substance.dto";
import { TranslocoModule, TranslocoService } from "@jsverse/transloco";

@Component({
    selector: "app-alternative-activity-overlay",
    standalone: true,
    imports: [CommonModule, FormsModule, TranslocoModule],
    templateUrl: "./alternative-activity-overlay.component.html",
})
export class AlternativeActivityOverlayComponent implements OnChanges {
    private usageFillingService = inject(UsageFillingService);
    private translateService = inject(TranslocoService);

    @Input() show = false;
    @Input() selectedSubstance?: SubstanceDto;
    @Input() motivationalFactorId?: number;
    @Output() closed = new EventEmitter<void>();
    @Output() selected = new EventEmitter<number>();
    @Output() feedback = new EventEmitter<{
        activity: any;
        wasSuccessful: boolean;
        feedback?: string;
    }>();
    @Output() giveUpUsage = new EventEmitter<void>();

    /** All alternatives with >= 80% success rate, sorted best-first */
    recommendedActivities: { id: number; name: string; successRate: number }[] = [];

    /** Whether to show the processing dialog */
    showProcessingDialog = false;
    /** Whether to show the feedback dialog */
    showFeedbackDialog = false;
    /** Currently selected activity */
    selectedActivity: any = null;
    /** Feedback message input */
    feedbackMessage = "";

    /** Whether to show the breathing exercise component */
    showBreathingExercise = false;
    /** Current breathing step (1: inhale, 2: hold, 3: exhale, 4: hold) */
    breathingStep = 1;
    /** Current breath count (out of totalBreaths) */
    currentBreath = 1;
    /** Total number of breaths for the exercise */
    totalBreaths = 5;
    /** Progress percentage for the current breathing step */
    breathingProgress = 0;
    /** Interval ID for the breathing animation timer */
    private breathingTimerId: any = null;

    /** Reference to Math for use in template */
    Math = Math;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['show']?.currentValue === true) {
            this.loadRecommendations();
        }
    }

    /**
     * Load alternative activity success rates from persistent storage
     * and build a list of all alternatives with >= 80% success rate.
     */
    private async loadRecommendations(): Promise<void> {
        const counts = await this.usageFillingService.getAlternativeActivityCounts();
        const recommendations: { id: number; name: string; successRate: number }[] = [];

        counts.forEach((stats, activityId) => {
            if (stats.count > 0) {
                const successRate = (stats.successCount / stats.count) * 100;
                if (successRate >= 80) {
                    recommendations.push({
                        id: activityId,
                        name: this.getActivityName(activityId),
                        successRate: Math.round(successRate),
                    });
                }
            }
        });

        // Sort by success rate descending so the best appears first
        this.recommendedActivities = recommendations.sort(
            (a, b) => b.successRate - a.successRate
        );
    }

    select(activityId: number) {
        this.selectedActivity = {
            id: activityId,
            name: this.getActivityName(activityId),
        };

        this.selected.emit(activityId);
        this.show = false;

        if (activityId === 1) {
            this.startBreathingExercise();
        } else {
            this.showProcessingDialog = true;
            setTimeout(() => {
                this.showProcessingDialog = false;
                this.showFeedbackDialog = true;
            }, 3000);
        }
    }

    /**
     * Get activity name from ID
     */
    getActivityName(id: number): string {
        const names: Record<number, string> = {
            1: "Breathing Exercise",
            2: "Drink Water",
            3: "Take a Walk",
            4: "Stretching",
            5: "Healthy Snack",
            6: "Call a Friend",
        };
        return names[id] || id.toString();
    }

    /**
     * Handle feedback submission
     */
    handleSubmitFeedback(wasSuccessful: boolean): void {
        if (wasSuccessful && this.selectedSubstance) {
            const usageFilling: UsageFillingAddDto = {
                datetime: new Date(),
                substance: this.selectedSubstance.id,
                motivational_factor: this.motivationalFactorId,
                alternative_activity: this.selectedActivity
                    ? parseInt(this.selectedActivity.id)
                    : undefined,
                kept_usage: false,
            };

            this.usageFillingService.add(usageFilling).catch((error) => {
                console.error("Error recording alternative activity success:", error);
            });

            this.giveUpUsage.emit();
        }

        this.feedback.emit({
            activity: this.selectedActivity,
            wasSuccessful,
            feedback: this.feedbackMessage,
        });

        this.showFeedbackDialog = false;
        this.feedbackMessage = "";
    }

    /**
     * Cancel feedback dialog
     */
    handleCancelFeedback(): void {
        this.showFeedbackDialog = false;
        this.feedbackMessage = "";
    }

    /**
     * Start the breathing exercise
     */
    startBreathingExercise(): void {
        this.showBreathingExercise = true;
        this.breathingStep = 1;
        this.currentBreath = 1;
        this.breathingProgress = 0;
        this.startBreathingAnimation();
    }

    /**
     * Handle the breathing animation timing
     */
    private startBreathingAnimation(): void {
        if (this.breathingTimerId) {
            clearInterval(this.breathingTimerId);
        }

        let startTime = Date.now();
        const stepDurations = {
            1: 4000,
            2: 2000,
            3: 4000,
            4: 2000,
        };

        this.breathingTimerId = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const currentDuration =
                stepDurations[this.breathingStep as keyof typeof stepDurations];

            this.breathingProgress = Math.min(
                100,
                (elapsed / currentDuration) * 100
            );

            if (elapsed >= currentDuration) {
                this.moveToNextBreathingStep();
                startTime = Date.now();
            }
        }, 50);
    }

    /**
     * Move to the next breathing step
     */
    private moveToNextBreathingStep(): void {
        this.breathingStep++;

        if (this.breathingStep > 4) {
            this.breathingStep = 1;
            this.currentBreath++;

            if (this.currentBreath > this.totalBreaths) {
                this.completeBreathingExercise();
                return;
            }
        }
    }

    /**
     * Complete the breathing exercise
     */
    completeBreathingExercise(): void {
        if (this.breathingTimerId) {
            clearInterval(this.breathingTimerId);
            this.breathingTimerId = null;
        }
        this.showBreathingExercise = false;
        this.showFeedbackDialog = true;
    }

    /**
     * Skip the breathing exercise
     */
    skipBreathingExercise(): void {
        if (this.breathingTimerId) {
            clearInterval(this.breathingTimerId);
            this.breathingTimerId = null;
        }
        this.showBreathingExercise = false;
        this.showFeedbackDialog = true;
    }

    /**
     * Get text instruction for current breathing step
     */
    getBreathingInstruction(): string {
        switch (this.breathingStep) {
            case 1: return this.translateService.translate("Inhale slowly through your nose...");
            case 2: return this.translateService.translate("Hold your breath...");
            case 3: return this.translateService.translate("Exhale slowly through your mouth...");
            case 4: return this.translateService.translate("Hold briefly...");
            default: return "";
        }
    }

    /**
     * Get animation class for the breathing circle
     */
    getBreathingAnimationClass(): string {
        switch (this.breathingStep) {
            case 1: return "animate-breathe-in";
            case 2: return "animate-breathe-hold";
            case 3: return "animate-breathe-out";
            case 4: return "animate-breathe-hold";
            default: return "";
        }
    }
}
