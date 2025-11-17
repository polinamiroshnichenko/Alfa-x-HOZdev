import os
import time
import pandas as pd
import requests
import re
import urllib.parse
import unicodedata
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, ElementClickInterceptedException
from webdriver_manager.chrome import ChromeDriverManager

EXCEL_PATH = "/preprocessing/result_with_names_new (3).xlsx"
BASE_DIR_44 = "../44-fz"
BASE_DIR_223 = "../223-fz"


def ensure_dir(path):
    os.makedirs(path, exist_ok=True)


def download_file(url, folder, cookies_dict):
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
        }

        r = requests.get(
            url,
            stream=True,
            timeout=30,
            cookies=cookies_dict,
            headers=headers,
            allow_redirects=True
        )
        r.raise_for_status()

        filename = url.split("/")[-1].split("?")[0] or "file"

        # извлечение имени файла
        if 'Content-Disposition' in r.headers:
            cd_header = r.headers['Content-Disposition']
            try:
                match = re.search(r'filename\*?=(?:UTF-8\'\')?\"?([^"]+)\"?', cd_header, re.I)

                if match:
                    extracted_filename = match.group(1).replace(';', '').strip()

                    if '%' in extracted_filename:
                        filename = urllib.parse.unquote(extracted_filename)

                        try:
                            filename = filename.encode('latin1').decode('utf8')
                        except Exception:
                            pass
                    else:
                        filename = extracted_filename

                    filename = unicodedata.normalize('NFC', filename)
                    filename = filename.strip('"')

            except Exception as e:
                print(f"Ошибка парсинга: {e}")
                pass

        filepath = os.path.join(folder, filename)

        if os.path.exists(filepath):
            print(f"Файл уже существует: {filename}")
            return

        with open(filepath, "wb") as f:
            for chunk in r.iter_content(1024 * 1024):
                f.write(chunk)
        print(f"Скачан файл: {filename}")

    except requests.exceptions.HTTPError as e:
        print(f"HTTP-ошибка при скачивании {url}: {e}")
    except Exception as e:
        print(f"Ошибка при скачивании {url}: {e}")


def setup_driver():
    chrome_options = Options()
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option("useAutomationExtension", False)
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    driver.set_window_size(1920, 1080)
    return driver


def get_attachment_links(driver, url, timeout=10):
    driver.get(url)
    wait = WebDriverWait(driver, timeout)
    attachment_links = []

    try:
        close_button = WebDriverWait(driver, 5).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR,
                                        '#modal-customer button.close, #modal-customer .modal-close, #modal-customer .btn-close'))
        )
        close_button.click()
        WebDriverWait(driver, 5).until_not(
            EC.visibility_of_element_located((By.ID, 'modal-customer'))
        )
    except TimeoutException:
        pass
    except Exception as e:
        print(f"Не удалось закрыть модальное окно: {e}")

    print("Ищется вкладка Документы")

    try:

        flexible_tab_xpath = '//a[contains(@href, "documents") or contains(text(), "Документ") or contains(text(), "документ")]'
        doc_tabs = wait.until(EC.presence_of_all_elements_located((By.XPATH, flexible_tab_xpath)))

        if not doc_tabs:
            print("Не найдено ни одной вкладки Документы")
            return []

        # проблема - вкладок документы две
        print(f"Найдено вкладок Документы: {len(doc_tabs)}")
        last_doc_tab = wait.until(EC.element_to_be_clickable(doc_tabs[-1]))
        last_doc_tab.click()

        wait.until(EC.presence_of_element_located((By.XPATH, '//a[contains(@href, "download")]')))
        print("Вкладка Документы открыта, ссылки на скачивание загрузились")
        time.sleep(1.5)

    except TimeoutException:
        print(f"Ошибка: Не удалось найти вкладку")
        return []
    except Exception as e:
        print(f"Ошибка при попытке открыть вкладку: {e}")
        return []

    try:
        show_more_xpath = '//a[contains(text(), "Показать больше") or contains(text(), "Показать все")]'
        show_more_button = WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.XPATH, show_more_xpath)))

        if show_more_button.is_displayed():
            driver.execute_script("arguments[0].click();", show_more_button)
            print("Кликнули по 'Показать больше/все'.")
            time.sleep(2)

    except TimeoutException:
        pass
    except Exception as e:
        print(f"Ошибка при попытке кликнуть 'Показать больше': {e}")

    print("Собираем ссылки на файлы")
    attachment_xpath = '//a[contains(@href, "download") and (contains(@href, "document") or contains(@href, "file"))]'
    links = driver.find_elements(By.XPATH, attachment_xpath)

    if not links:
        attachment_xpath = '//a[contains(@href, "download") and not(contains(@href, "#"))]'
        links = driver.find_elements(By.XPATH, attachment_xpath)

    for link in links:
        href = link.get_attribute('href')
        if href and 'download' in href:
            attachment_links.append(href)

    return list(set(attachment_links))


def process_tender(driver, reg_number, law_type):
    print(f"\n Обработка {reg_number} ({law_type})")

    if law_type == "44-ФЗ":
        url = f"https://zakupki.gov.ru/epz/order/notice/zk20/view/common-info.html?regNumber={reg_number}"
        folder = os.path.join(BASE_DIR_44, reg_number)
    else:
        url = f"https://zakupki.gov.ru/epz/order/notice/notice223/common-info.html?regNumber={reg_number}"
        folder = os.path.join(BASE_DIR_223, reg_number)

    ensure_dir(folder)

    try:
        file_urls = get_attachment_links(driver, url)

        selenium_cookies = driver.get_cookies()
        requests_cookies = {cookie['name']: cookie['value'] for cookie in selenium_cookies}

        if not file_urls:
            print(f"файлы не найдены для {reg_number}")
            return

        print(f"найдено файлов: {len(file_urls)}")
        for file_url in file_urls:
            download_file(file_url, folder, requests_cookies)

    except Exception as e:
        print(f"ошибка при обработке {reg_number}: {e}")


def main():
    df = pd.read_excel(EXCEL_PATH, dtype={"Реестровый номер закупки": str})
    df = df.dropna(subset=["Реестровый номер закупки"])
    df["Реестровый номер закупки"] = df["Реестровый номер закупки"].astype(str).str.strip()
    df["Закупки по"] = df["Закупки по"].astype(str).str.strip()
    df = df[df["Закупки по"].isin(["44-ФЗ", "223-ФЗ"])]

    driver = setup_driver()
    try:
        for _, row in df.iterrows():
            process_tender(driver, row["Реестровый номер закупки"], row["Закупки по"])
            print("Ожидание 60 секунд перед следующей закупкой")
            time.sleep(60)
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
