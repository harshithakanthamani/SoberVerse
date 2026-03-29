import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { PanelModule } from "primeng/panel";
import { ToastModule } from "primeng/toast";
import { FloatLabelModule } from "primeng/floatlabel";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ConfirmationService, MessageService } from "primeng/api";
import { TranslocoModule, TranslocoService } from "@jsverse/transloco";

import { invoke } from "@tauri-apps/api/core";

import { CostService } from "../../services/cost.service";
import { SubstanceService } from "../../services/substance.service";
import { UsageService } from "../../services/usage.service";
import { TriggerService } from "../../services/trigger.service";
import { BackupService } from "../../services/backup.service";
import { CommonModule } from "@angular/common";

interface SaveFileResult {
    path: string;
    msg: string;
    result: boolean;
}

@Component({
    selector: "app-backup",
    standalone: true,
    imports: [
        ButtonModule,
        FormsModule,
        InputTextModule,
        PanelModule,
        ToastModule,
        FloatLabelModule,
        ConfirmDialogModule,
        TranslocoModule,
        CommonModule,
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: "./backup.component.html",
    styleUrl: "./backup.component.scss",
})
export class BackupComponent {
    private costService = inject(CostService);
    private substanceService = inject(SubstanceService);
    private usageService = inject(UsageService);
    private triggerService = inject(TriggerService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private backupService = inject(BackupService);
    private translateService = inject(TranslocoService);

    encryptKey: string;
    encryptedBackup: string;

    decryptKey: string;
    backupString: string;

    filePathDownload: string;

    filePointer: any;

    restoreMode = false;

    generateBackup() {
        if (!this.encryptKey || this.encryptKey.length < 6) {
            this.messageService.add({
                summary: this.translateService.translate("Error"),
                detail: this.translateService.translate(
                    "Password must be at least 6 characters."
                ),
                severity: "error",
            });
            return;
        }
        this.backupService.backupData(this.encryptKey).subscribe({
            next: (encryptedBackup) => {
                this.encryptedBackup = encryptedBackup;
                this.messageService.add({
                    summary: this.translateService.translate("Backup generated"),
                    detail: this.translateService.translate(
                        "Backup created successfully! Save this data in a safe place."
                    ),
                    severity: "success",
                });
            },
            error: () => {
                this.messageService.add({
                    summary: this.translateService.translate("Error"),
                    detail: this.translateService.translate(
                        "Failed to generate backup."
                    ),
                    severity: "error",
                });
            },
        });
    }

    copyToClipboard(textareaElement: HTMLTextAreaElement) {
        textareaElement.focus();
        textareaElement.select();
        document.execCommand("copy");
        this.messageService.add({
            detail: this.translateService.translate("Backup copied to clipboard."),
            summary: this.translateService.translate("Copied!"),
            severity: "success",
        });
    }

    async saveToFile() {
        const result = (await invoke("save_backup_file", {
            backupStr: this.encryptedBackup,
        })) as SaveFileResult;
        if (result.result) {
            this.messageService.add({
                detail: this.translateService.translate("Backup saved to ") + result.path,
                summary: result.msg,
                severity: "success",
            });
            this.filePathDownload = result.path;
        } else {
            this.messageService.add({
                detail: this.translateService.translate("Error saving {path}: {msg}", { path: result.path, msg: result.msg }),
                summary: this.translateService.translate("Error saving file"),
                severity: "error",
            });
        }
    }

    onFileChange(event: Event) {
        const fileElement = event.target as HTMLInputElement;
        const fileList: FileList | null = fileElement.files;
        if (fileList && fileList.length > 0) {
            this.filePointer = fileList[0];
            const reader = new FileReader();
            reader.readAsText(fileList[0], "UTF-8");
            reader.onload = (evt) => {
                this.backupString = evt.target?.result as string;
            };
        }
    }

    async restoreBackupDialog(event: Event) {
        if (!this.decryptKey || this.decryptKey.length < 6) {
            this.messageService.add({
                summary: this.translateService.translate("Error"),
                detail: this.translateService.translate("Password must be at least 6 characters."),
                severity: "error",
            });
            return;
        }
        if (!this.backupString && !this.filePointer) {
            this.messageService.add({
                summary: this.translateService.translate("Error"),
                detail: this.translateService.translate("Paste your encrypted backup or select a file."),
                severity: "error",
            });
            return;
        }
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: this.translateService.translate(
                "Are you sure you want to restore this backup? Your current data will be erased and cannot be recovered!"
            ),
            header: this.translateService.translate("Confirm"),
            icon: "pi pi-exclamation-triangle",
            accept: () => {
                this.restoreBackup();
            },
        });
    }

    restoreBackup() {
        this.backupService
            .restoreBackup(this.backupString, this.decryptKey)
            .subscribe({
                complete: async () => {
                    this.messageService.add({
                        summary: this.translateService.translate("Restored successfully!"),
                        detail: this.translateService.translate("Your backup has been restored. Your data is now available."),
                        severity: "success",
                        life: 4000,
                    });
                },
                error: async () => {
                    this.messageService.add({
                        summary: this.translateService.translate("Backup error"),
                        detail: this.translateService.translate("Could not restore your backup. Please try again."),
                        severity: "error",
                        life: 4000,
                    });
                },
            });
    }
}
